from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date

from .models import User, UserHistory
from .serializers import UserSerializer
from django.core.mail import send_mail
from django.conf import settings


# =====================================================
# CUSTOM PERMISSION → USE USER.role INSTEAD OF is_staff
# =====================================================
class IsAdminRole(BasePermission):
    """
    Allows access ONLY if user.role == 'ADMIN'
    """
    def has_permission(self, request, view):
        return hasattr(request.user, "role") and request.user.role == "ADMIN"


# =====================================================
# AUTHENTICATION
# =====================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Missing credentials'}, status=400)

    try:
        user = User.objects.get(email_address=email)

        if not user.check_password(password):
            return Response({'error': 'Invalid email or password'}, status=401)

        # Correct token creation
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'name': user.name,
                'surname': user.surname,
                'email': user.email_address,
                'registered_payment_method': user.registered_payment_method,
                'role': user.role,
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
    role = request.data.get('role', 'GUEST')

    if not email or not password or not first_name or not last_name:
        return Response({'error': 'Missing fields'}, status=400)

    if User.objects.filter(email_address=email).exists():
        return Response({'error': 'Email already exists'}, status=400)

    user = User.objects.create(
        email_address=email,
        name=first_name,
        surname=last_name,
        role=role,
    )
    user.set_password(password)
    user.save()

    UserHistory.objects.create(
        user=user,
        date_of_registration=date.today(),
        number_of_reservations=0
    )

    # Correct token creation
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role

    return Response({
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
        'role': user.role,
    })


# =====================================================
# USER CRUD + PROFILE + PASSWORD
# =====================================================
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class NoPagination(PageNumberPagination):
    page_size = 10000

class UserViewSet(viewsets.ModelViewSet):

    def list(self, request, *args, **kwargs):
        # If searching, return ALL users without pagination
        if "search" in request.query_params:
            self.pagination_class = None

        return super().list(request, *args, **kwargs)
    queryset = User.objects.all()
    serializer_class = UserSerializer

    # FIX → use our custom admin role permission
    permission_classes = [IsAdminRole]

    # --------------------------------------------------
    # UPDATE PROFILE
    # --------------------------------------------------
    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated], url_path="update-profile")
    def update_profile(self, request, pk=None):
        user = self.get_object()

        if request.user.id != user.id and request.user.role != "ADMIN":
            return Response({"error": "Not allowed"}, status=403)

        # Map payload names → serializer names
        corrected = {
            "firstName": request.data.get("name") or request.data.get("firstName"),
            "lastName": request.data.get("surname") or request.data.get("lastName"),
            "email": request.data.get("email_address") or request.data.get("email"),
            "registered_payment_method": request.data.get("registered_payment_method"),
        }

        serializer = UserSerializer(user, data=corrected, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)

        return Response(serializer.errors, status=400)

    # --------------------------------------------------
    # CHANGE PASSWORD
    # --------------------------------------------------
    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated], url_path="change-password")
    def change_password(self, request, pk=None):
        user = self.get_object()

        old_password = request.data.get("old_password") or request.data.get("oldPassword")
        new_password = request.data.get("new_password") or request.data.get("newPassword")

        if not old_password or not new_password:
            return Response({"error": "Both old and new passwords are required"}, status=400)

        if not user.check_password(old_password):
            return Response({"error": "Old password incorrect"}, status=400)

        # Update password
        user.set_password(new_password)
        user.save()

        # 🔥 SEND EMAIL TO USER WHO CHANGED PASSWORD
        from django.core.mail import send_mail
        send_mail(
            subject="Your password was changed",
            message=f"Hello {user.name}, your password was successfully changed.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email_address], 
            fail_silently=False,
        )

        return Response({"message": "Password changed successfully"}, status=200)
