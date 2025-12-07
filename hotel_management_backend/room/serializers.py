from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    """Serializer for Room model"""
    room_number = serializers.IntegerField(source='number')
    room_type = serializers.CharField(source='amenities', read_only=True)
    is_available = serializers.BooleanField(source='available', read_only=True)
    price_per_night = serializers.DecimalField(
        source='price', 
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    capacity = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = [
            'id',
            'room_number',
            'room_type',
            'amenities',
            'scenery',
            'is_available',
            'price_per_night',
            'capacity',
            'maintenance',
        ]
    
    def get_capacity(self, obj):
        """Estimate capacity based on room amenities or default to 2"""
        # You can customize this logic based on your needs
        amenities = obj.amenities or ''
        if 'suite' in amenities.lower() or 'deluxe' in amenities.lower():
            return 4
        elif 'double' in amenities.lower():
            return 2
        else:
            return 1
