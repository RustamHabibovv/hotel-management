from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import User


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that works with our custom User model.
    """
    
    def get_user(self, validated_token):
        """
        Retrieve the user from our custom User model using the user_id from the token.
        """
        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                raise InvalidToken('Token contained no recognizable user identification')
            
            user = User.objects.get(id=user_id)
            return user
        except User.DoesNotExist:
            raise InvalidToken('User not found')
