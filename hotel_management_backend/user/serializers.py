from rest_framework import serializers
from .models import User, UserHistory


# ============================================================
# USER SERIALIZER (used for: admin list, admin update, profile update)
# ============================================================
class UserSerializer(serializers.ModelSerializer):
    # Frontend-friendly names
    firstName = serializers.CharField(source="name", required=False)
    lastName = serializers.CharField(source="surname", required=False)
    email = serializers.EmailField(source="email_address", required=False)

    registered_payment_method = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    # Admin-only field (create user)
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
            "password",  # admin create only
        ]

    # =====================================================
    # CREATE USER (ADMIN ONLY)
    # =====================================================
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

        # Handle password
        if password:
            user.set_password(password)
        else:
            user.set_password("default123")

        user.save()
        return user

    # =====================================================
    # UPDATE USER (ADMIN OR PROFILE)
    # =====================================================
    def update(self, instance, validated_data):

        # Mapped fields already inside validated_data
        instance.name = validated_data.get("name", instance.name)
        instance.surname = validated_data.get("surname", instance.surname)
        instance.email_address = validated_data.get("email_address", instance.email_address)

        # Payment method
        instance.registered_payment_method = validated_data.get(
            "registered_payment_method", 
            instance.registered_payment_method
        )

        # Role (optional but allowed for admin)
        if "role" in validated_data:
            instance.role = validated_data["role"]

        instance.save()
        return instance


# ============================================================
# LOGIN SERIALIZER (only used if needed, safe to keep)
# ============================================================
class UserLoginSerializer(serializers.Serializer):
    email_address = serializers.EmailField()
    password = serializers.CharField(write_only=True)
