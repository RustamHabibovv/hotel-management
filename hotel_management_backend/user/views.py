from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from datetime import date

from .models import User, UserHistory
from .serializers import UserSerializer


# =====================================================
# AUTHENTICATION ENDPOINTS (KEEPING YOUR ORIGINAL ONES)
# =====================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email:
        return Response({'error': 'Email is required'}, status=400)

    if not password:
        return Response({'error': 'Password is required'}, status=400)

    try:
        user = User.objects.get(email_address=email)

        if not user.password:
            return Response({'error': 'Password not set'}, status=401)

        if not user.check_password(password):
            return Response({'error': 'Invalid email or password'}, status=401)

        refresh = RefreshToken()
        refresh['user_id'] = user.id
        refresh['role'] = user.role or 'GUEST'

        return Response({
    'access': str(refresh.access_token),
    'refresh': str(refresh),
    'user': {
        'id': user.id,
        'name': user.name,
        'surname': user.surname,
        'email': user.email_address,
        'registered_payment_method': user.registered_payment_method,  # <-- ADD THIS
        'role': user.role or 'GUEST',
    }
})


    except User.DoesNotExist:
        return Response({'error': 'Invalid email or password'}, status=401)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('firstName')
    last_name = request.data.get('lastName')
    role = request.data.get('role', 'GUEST').upper()

    if not email or not password or not first_name or not last_name:
        return Response({'error': 'Missing fields'}, status=400)

    if User.objects.filter(email_address=email).exists():
        return Response({'error': 'Email already exists'}, status=400)

    user = User.objects.create(
        email_address=email,
        name=first_name,
        surname=last_name,
        role=role
    )
    user.set_password(password)
    user.save()

    UserHistory.objects.create(
        user=user,
        date_of_registration=date.today(),
        number_of_reservations=0
    )

    refresh = RefreshToken()
    refresh['user_id'] = user.id
    refresh['role'] = user.role

    return Response({
        'message': 'User registered successfully',
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'name': user.name,
            'surname': user.surname,
            'email': user.email_address,
            'role': user.role,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    return Response({
        'id': user.id,
        'name': user.name,
        'surname': user.surname,
        'email': user.email_address,
        'registered_payment_method': user.registered_payment_method,
        'role': user.role or 'GUEST',
    })


# =====================================================
# MAIN: USER CRUD + PROFILE UPDATE + CHANGE PASSWORD
# =====================================================

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]   # Only admin can list/create/delete/update users

    # ------------------------------------------------
    # Profile update: /api/users/<id>/update-profile/
    # ------------------------------------------------
    @action(
        detail=True,
        methods=['put'],
        permission_classes=[IsAuthenticated],
        url_path="update-profile"   # <-- important
    )
    @action(
    detail=True,
    methods=['put'],
    permission_classes=[IsAuthenticated],
    url_path="update-profile"
    )
    def update_profile(self, request, pk=None):
        user = self.get_object()
        # Optional: block editing others unless admin
        if request.user.id != user.id and request.user.role != "ADMIN":
            return Response({"error": "Not allowed"}, status=403)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
            return Response(serializer.errors, status=400)


    # ------------------------------------------------
    # Password change: /api/users/<id>/change-password/
    # ------------------------------------------------
    @action(
    detail=True,
    methods=['put'],
    permission_classes=[IsAuthenticated],
    url_path="change-password"
)
    def change_password(self, request, pk=None):
        user = self.get_object()
        old_password = request.data.get("old_password") or request.data.get("oldPassword")
        new_password = request.data.get("new_password") or request.data.get("newPassword")
        if not old_password or not new_password:
            return Response({"error": "Both old and new passwords are required"}, status=400)
        if not user.check_password(old_password):
            return Response({"error": "Old password incorrect"}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully"}, status=200)
