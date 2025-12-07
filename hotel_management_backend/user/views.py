from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date
from .models import User, UserHistory

@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    """
    Custom login endpoint - requires email and password.
    
    POST /api/auth/custom-login/
    {
        "email": "john@example.com",
        "password": "yourpassword"
    }
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not password:
        return Response(
            {'error': 'Password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Find user by email
        user = User.objects.get(email_address=email)
        
        # Check if user has a password set
        if not user.password:
            return Response(
                {'error': 'Password not set for this user. Please contact administrator to set a password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verify password
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Create JWT tokens
        refresh = RefreshToken()
        refresh['user_id'] = user.id
        refresh['email'] = user.email_address
        refresh['role'] = user.role or 'GUEST'
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'name': user.name,
                'surname': user.surname,
                'email': user.email_address,
                'role': user.role or 'GUEST',
            }
        })
    
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user.
    
    POST /api/auth/register/
    {
        "email": "user@example.com",
        "password": "password123",
        "first_name": "John",
        "last_name": "Doe",
        "role": "guest"  # Optional: guest, staff, admin
    }
    """
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name') or request.data.get('firstName')
    last_name = request.data.get('last_name') or request.data.get('lastName')
    role = request.data.get('role', 'guest').upper()
    
    # Validation
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not password:
        return Response(
            {'error': 'Password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not first_name or not last_name:
        return Response(
            {'error': 'First name and last name are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if email already exists
    if User.objects.filter(email_address=email).exists():
        return Response(
            {'error': 'A user with this email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    try:
        user = User.objects.create(
            email_address=email,
            name=first_name,
            surname=last_name,
            role=role
        )
        user.set_password(password)
        user.save()
        
        # Create user history
        UserHistory.objects.create(
            user=user,
            date_of_registration=date.today(),
            number_of_reservations=0
        )
        
        # Create JWT tokens
        refresh = RefreshToken()
        refresh['user_id'] = user.id
        refresh['email'] = user.email_address
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
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Registration failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_current_user(request):
    """
    Get current logged-in user from JWT token.
    
    GET /api/auth/me/
    """
    # request.user is now our custom User object thanks to CustomJWTAuthentication
    user = request.user
    
    # If authentication passed, we have a valid user
    return Response({
        'id': user.id,
        'name': user.name,
        'surname': user.surname,
        'email': user.email_address,
        'role': user.role or 'GUEST',
    })
