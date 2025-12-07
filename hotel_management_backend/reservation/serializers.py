from rest_framework import serializers
from .models import Reservation
from room.models import Room, ReservationRoom
from user.models import User
from datetime import date, timedelta
from .email_service import send_reservation_email

class RoomDetailsSerializer(serializers.ModelSerializer):
    """Nested serializer for room details"""
    room_number = serializers.CharField(source='number')
    price_per_night = serializers.DecimalField(max_digits=10, decimal_places=2, source='price', read_only=True)
    
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'amenities', 'scenery', 'price_per_night', 'available']


class ReservationSerializer(serializers.ModelSerializer):
    """
    Serializer that maps frontend expectations to UML schema.
    
    Frontend expects: check_in_date, check_out_date, status, guest_name, etc.
    Database has: date, hour, number_of_guests, price, duration
    
    This serializer bridges the gap without changing the DB schema.
    """
    
    # Frontend fields (mapped to DB fields)
    check_in_date = serializers.DateField(source='date')
    check_out_date = serializers.SerializerMethodField()
    guest_name = serializers.SerializerMethodField()
    guest_email = serializers.CharField(source='user.email_address', read_only=True)
    total_price = serializers.FloatField(source='price')
    status = serializers.SerializerMethodField()
    number_of_nights = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
    
    # Room details (from ReservationRoom relationship)
    room_details = serializers.SerializerMethodField()
    room_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Reservation
        fields = [
            'id',
            'check_in_date',
            'check_out_date',
            'guest_name',
            'guest_email',
            'number_of_guests',
            'total_price',
            'status',
            'room_details',
            'room_id',
            'number_of_nights',
            'hour',
            'duration',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'guest_name', 'guest_email']
    
    def get_check_out_date(self, obj):
        """Calculate check-out date from date + duration"""
        if obj.date and obj.duration:
            return (obj.date + timedelta(days=int(obj.duration))).isoformat()
        return None
    
    def get_status(self, obj):
        """Determine status based on dates and cancellation (price = -1 means cancelled)"""
        # Check if cancelled (we use negative price as a cancellation marker)
        if obj.price < 0:
            return 'cancelled'
        
        today = date.today()
        if obj.date > today:
            return 'confirmed'
        elif obj.date == today:
            return 'checked-in'
        else:
            check_out = obj.date + timedelta(days=int(obj.duration))
            if today > check_out:
                return 'checked-out'
            else:
                return 'checked-in'
    
    def get_guest_name(self, obj):
        """Get full name from user"""
        if obj.user:
            return f"{obj.user.name} {obj.user.surname}".strip()
        return "Unknown Guest"
    
    def get_number_of_nights(self, obj):
        """Return duration as number of nights"""
        return int(obj.duration) if obj.duration else 0
    
    def get_room_details(self, obj):
        """Get room details from ReservationRoom relationship"""
        reservation_room = ReservationRoom.objects.filter(reservation=obj).first()
        if reservation_room and reservation_room.room:
            return RoomDetailsSerializer(reservation_room.room).data
        return None
    
    def get_created_at(self, obj):
        """Use date as created_at for now"""
        return obj.date.isoformat() + "T00:00:00Z"
    
    def get_updated_at(self, obj):
        """Use date as updated_at for now"""
        return obj.date.isoformat() + "T00:00:00Z"
    
    def validate(self, data):
        """Validate reservation data"""
        check_in = data.get('date')  # This is check_in_date mapped to 'date'
        duration = data.get('duration')
        
        if check_in and check_in < date.today():
            raise serializers.ValidationError(
                "Check-in date cannot be in the past."
            )
        
        if duration and duration < 1:
            raise serializers.ValidationError(
                "Duration must be at least 1 night."
            )
        
        number_of_guests = data.get('number_of_guests')
        if number_of_guests and number_of_guests < 1:
            raise serializers.ValidationError(
                "Number of guests must be at least 1."
            )
        
        # Check room availability if room_id is provided
        room_id = self.initial_data.get('room_id')
        if room_id and check_in and duration:
            check_out = check_in + timedelta(days=int(duration))
            
            # Find existing reservations for this room that overlap with requested dates
            overlapping_reservations = ReservationRoom.objects.filter(
                room_id=room_id,
                reservation__price__gte=0  # Exclude cancelled reservations
            ).select_related('reservation')
            
            for res_room in overlapping_reservations:
                res = res_room.reservation
                res_check_out = res.date + timedelta(days=int(res.duration))
                
                # Check if dates overlap:
                # New reservation overlaps if it starts before existing ends AND ends after existing starts
                if check_in < res_check_out and check_out > res.date:
                    # Skip if we're updating the same reservation
                    if self.instance and self.instance.id == res.id:
                        continue
                    
                    raise serializers.ValidationError({
                        'room_id': f'Room is already booked from {res.date} to {res_check_out.strftime("%Y-%m-%d")}. Please choose different dates or another room.'
                    })
        
        return data
    
    def create(self, validated_data):
        """Create reservation and link to room"""
        request = self.context.get('request')
        room_id = validated_data.pop('room_id', None)
        
        # Set user from request
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
            
            # Get or create user_history
            from user.models import UserHistory
            user_history, created = UserHistory.objects.get_or_create(
                user=request.user,
                defaults={'date_of_registration': date.today(), 'number_of_reservations': 0}
            )
            validated_data['user_history'] = user_history
        
        # Create reservation
        reservation = Reservation.objects.create(**validated_data)
        
        # Link room if provided
        if room_id:
            try:
                room = Room.objects.get(id=room_id)
                ReservationRoom.objects.create(reservation=reservation, room=room)
            except Room.DoesNotExist:
                pass
        
        # Send confirmation email
        try:
            send_reservation_email(reservation, email_type='created')
        except Exception as e:
            print(f"Failed to send email: {e}")
        
        return reservation
    
    def update(self, instance, validated_data):
        """Update reservation"""
        room_id = validated_data.pop('room_id', None)
        validated_data.pop('user', None)  # Don't allow changing user
        
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update room if provided
        if room_id:
            ReservationRoom.objects.filter(reservation=instance).delete()
            try:
                room = Room.objects.get(id=room_id)
                ReservationRoom.objects.create(reservation=instance, room=room)
            except Room.DoesNotExist:
                pass
        
        # Send modification email
        try:
            send_reservation_email(instance, email_type='modified')
        except Exception as e:
            print(f"Failed to send email: {e}")
        
        return instance


class ReservationListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views"""
    check_in_date = serializers.DateField(source='date')
    check_out_date = serializers.SerializerMethodField()
    guest_name = serializers.SerializerMethodField()
    total_price = serializers.FloatField(source='price')
    status = serializers.SerializerMethodField()
    number_of_nights = serializers.SerializerMethodField()
    room_details = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Reservation
        fields = [
            'id',
            'room_details',
            'check_in_date',
            'check_out_date',
            'guest_name',
            'number_of_guests',
            'total_price',
            'status',
            'number_of_nights',
            'created_at',
        ]
    
    def get_guest_name(self, obj):
        """Get full name from user"""
        if obj.user:
            return f"{obj.user.name} {obj.user.surname}".strip()
        return "Unknown Guest"
    
    def get_check_out_date(self, obj):
        if obj.date and obj.duration:
            return (obj.date + timedelta(days=int(obj.duration))).isoformat()
        return None
    
    def get_status(self, obj):
        """Determine status based on dates and cancellation"""
        # Check if cancelled (negative price means cancelled)
        if obj.price < 0:
            return 'cancelled'
        
        today = date.today()
        if obj.date > today:
            return 'confirmed'
        elif obj.date == today:
            return 'checked-in'
        else:
            check_out = obj.date + timedelta(days=int(obj.duration))
            return 'checked-out' if today > check_out else 'checked-in'
    
    def get_number_of_nights(self, obj):
        return int(obj.duration) if obj.duration else 0
    
    def get_room_details(self, obj):
        reservation_room = ReservationRoom.objects.filter(reservation=obj).first()
        if reservation_room and reservation_room.room:
            return RoomDetailsSerializer(reservation_room.room).data
        return None
    
    def get_created_at(self, obj):
        """Use date as created_at for now"""
        return obj.date.isoformat() + "T00:00:00Z"
    
    def get_created_at(self, obj):
        return obj.date.isoformat() + "T00:00:00Z"
