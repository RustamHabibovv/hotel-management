from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Reservation
from .serializers import ReservationSerializer, ReservationListSerializer
from .email_service import send_reservation_email
from user.models import User

class ReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling reservation operations.
    
    Endpoints:
    - GET /api/reservations/ - List all reservations (admin only)
    - GET /api/reservations/my_reservations/ - Get current user's reservations
    - POST /api/reservations/ - Create new reservation
    - GET /api/reservations/{id}/ - Get specific reservation
    - PUT/PATCH /api/reservations/{id}/ - Update reservation
    - DELETE /api/reservations/{id}/ - Cancel reservation
    """
    
    queryset = Reservation.objects.select_related('user', 'user_history').all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['date', 'price']
    ordering_fields = ['date', 'price', 'id']
    search_fields = ['user__name', 'user__surname', 'user__email_address']
    
    def get_serializer_class(self):
        """Use lighter serializer for list views"""
        if self.action == 'list':
            return ReservationListSerializer
        return ReservationSerializer
    
    def get_queryset(self):
        """
        Filter reservations based on user role.
        Regular users only see their own reservations.
        """
        user = self.request.user
        
        # If you implement role-based access, admin can see all
        # For now, all authenticated users see only their reservations
        if self.action == 'list':
            return self.queryset.filter(user=user)
        
        return self.queryset
    
    def perform_create(self, serializer):
        """Set the user when creating a reservation"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_reservations(self, request):
        """
        Get all reservations for the currently logged-in user.
        
        GET /api/reservations/my_reservations/
        Optional query params:
        - status: filter by status (pending, confirmed, checked-in, checked-out, cancelled)
        - ordering: order results (-check_in_date, created_at, etc.)
        """
        user = request.user
        reservations = self.queryset.filter(user=user)
        
        # Apply ordering - map frontend fields to database fields
        ordering = request.query_params.get('ordering', '-date')
        # Map frontend field names to backend field names
        field_mapping = {
            'check_in_date': 'date',
            '-check_in_date': '-date',
            'created_at': 'id',  # Use id as proxy for creation order
            '-created_at': '-id',
            'total_price': 'price',
            '-total_price': '-price',
        }
        ordering = field_mapping.get(ordering, ordering)
        reservations = reservations.order_by(ordering)
        
        # Serialize all reservations
        serializer = ReservationListSerializer(reservations, many=True)
        data = serializer.data
        
        # Apply status filter after serialization (since status is calculated)
        status_filter = request.query_params.get('status', None)
        if status_filter:
            data = [item for item in data if item.get('status') == status_filter]
        
        # Return paginated or full response
        page = self.paginate_queryset(reservations)
        if page is not None:
            # For paginated response, we need to filter the serialized data
            return self.get_paginated_response(data)
        
        return Response(data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        """
        Cancel a reservation by marking price as negative.
        
        POST /api/reservations/{id}/cancel/
        """
        reservation = self.get_object()
        
        # Check if user owns this reservation
        if reservation.user != request.user:
            return Response(
                {'error': 'You do not have permission to cancel this reservation.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already cancelled
        if reservation.price < 0:
            return Response(
                {'error': 'Reservation is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as cancelled by making price negative
        reservation.price = -abs(reservation.price)
        reservation.save()
        
        # Send cancellation email
        try:
            send_reservation_email(reservation, email_type='cancelled')
        except Exception as e:
            print(f"Failed to send cancellation email: {e}")
        
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)
