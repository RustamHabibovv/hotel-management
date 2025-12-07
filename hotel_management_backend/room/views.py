from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Room, ReservationRoom
from .serializers import RoomSerializer


class RoomViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving rooms.
    
    Endpoints:
    - GET /api/rooms/ - List all available rooms
    - GET /api/rooms/{id}/ - Get specific room details
    - GET /api/rooms/available/ - List available rooms with filters
    """
    queryset = Room.objects.filter(available=True, maintenance=False)
    serializer_class = RoomSerializer
    permission_classes = [AllowAny]  # Anyone can view available rooms
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['available', 'amenities']
    ordering_fields = ['number', 'price']
    search_fields = ['amenities', 'scenery']
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def available(self, request):
        """
        Get available rooms with optional filters.
        
        GET /api/rooms/available/
        Query params:
        - min_price: minimum price per night
        - max_price: maximum price per night
        - room_type: filter by amenities (partial match)
        - check_in: check-in date (YYYY-MM-DD) to filter out booked rooms
        - check_out: check-out date (YYYY-MM-DD) to filter out booked rooms
        """
        rooms = self.queryset
        
        # Get date range parameters
        check_in_str = request.query_params.get('check_in')
        check_out_str = request.query_params.get('check_out')
        
        # Filter out rooms that are booked for the requested date range
        if check_in_str and check_out_str:
            try:
                check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
                check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
                
                # Find rooms that have reservations overlapping with the requested dates
                # A reservation overlaps if:
                # 1. It starts before check_out AND
                # 2. It ends after check_in
                # Also exclude cancelled reservations (price < 0)
                booked_room_ids = ReservationRoom.objects.filter(
                    reservation__date__lt=check_out,  # Reservation starts before our check-out
                    reservation__price__gte=0  # Not cancelled
                ).filter(
                    # Reservation ends after our check-in
                    # (reservation.date + reservation.duration days)
                    reservation__date__gte=check_in - timedelta(days=30)  # Conservative check
                ).values_list('room_id', flat=True).distinct()
                
                # More precise filtering: check if reservation end date is after check_in
                from reservation.models import Reservation
                precise_booked_rooms = []
                for reservation_room in ReservationRoom.objects.filter(
                    reservation__date__lt=check_out,
                    reservation__price__gte=0
                ).select_related('reservation'):
                    res = reservation_room.reservation
                    res_end_date = res.date + timedelta(days=int(res.duration))
                    # Check if reservation overlaps with requested dates
                    if res.date < check_out and res_end_date > check_in:
                        precise_booked_rooms.append(reservation_room.room_id)
                
                # Exclude booked rooms
                rooms = rooms.exclude(id__in=precise_booked_rooms)
                
            except ValueError:
                pass  # Invalid date format, skip date filtering
        
        # Filter by price range
        min_price = request.query_params.get('min_price')
        if min_price:
            rooms = rooms.filter(price__gte=min_price)
        
        max_price = request.query_params.get('max_price')
        if max_price:
            rooms = rooms.filter(price__lte=max_price)
        
        # Filter by room type (amenities)
        room_type = request.query_params.get('room_type')
        if room_type and room_type.lower() != 'all':
            rooms = rooms.filter(amenities__icontains=room_type)
        
        # Order by price
        ordering = request.query_params.get('ordering', 'price')
        rooms = rooms.order_by(ordering)
        
        serializer = self.get_serializer(rooms, many=True)
        return Response(serializer.data)
