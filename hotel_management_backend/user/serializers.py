from rest_framework import serializers
from .models import User, UserHistory
from django.contrib.auth.hashers import make_password


# ====================================
# USER SERIALIZER (USED FOR CRUD API)
# ====================================
from rest_framework import serializers
from .models import User

# ====================================
# USER SERIALIZER (USED FOR CRUD + PROFILE)
# ====================================
from rest_framework import serializers
from .models import User, UserHistory

# ====================================
# USER SERIALIZER (USED FOR CRUD + PROFILE)
# ====================================
class UserSerializer(serializers.ModelSerializer):
    # Frontend-friendly field names
    firstName = serializers.CharField(source="name", required=False)
    lastName = serializers.CharField(source="surname", required=False)
    email = serializers.EmailField(source="email_address", required=False)
    registered_payment_method = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    # NEW FIELD (admin creates user only)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "firstName",
            "lastName",
            "email",
            "registered_payment_method",
            "role",
            "password",   # <-- added
        ]

    # ============================================================
    # CREATE USER (ADMIN)
    # ============================================================
    def create(self, validated_data):
        # Extract mapped fields
        name = validated_data.pop("name", None)
        surname = validated_data.pop("surname", None)
        email = validated_data.pop("email_address", None)
        password = validated_data.pop("password", None)

        user = User(
            name=name,
            surname=surname,
            email_address=email,
            role=validated_data.get("role"),
            registered_payment_method=validated_data.get("registered_payment_method"),
        )

        # Password hashing
        if password:
            user.set_password(password)
        else:
            user.set_password("default123")  # optional fallback

        user.save()
        return user

    # ============================================================
    # UPDATE USER (already correct)
    # ============================================================
    def update(self, instance, validated_data):
        if "name" in validated_data:
            instance.name = validated_data.pop("name")

        if "surname" in validated_data:
            instance.surname = validated_data.pop("surname")

        if "email_address" in validated_data:
            instance.email_address = validated_data.pop("email_address")

        if "registered_payment_method" in validated_data:
            instance.registered_payment_method = validated_data.pop("registered_payment_method")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

# ====================================
# REGISTRATION SERIALIZER
# ====================================
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['name', 'surname', 'email_address', 'password', 'password_confirm', 'role']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        # Create the user
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create user history
        UserHistory.objects.create(
            user=user,
            date_of_registration=None,
            number_of_reservations=0
        )
        
        return user


# ====================================
# LOGIN SERIALIZER
# ====================================
class UserLoginSerializer(serializers.Serializer):
    email_address = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
