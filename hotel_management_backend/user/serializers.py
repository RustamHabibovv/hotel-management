from rest_framework import serializers
from .models import User, UserHistory
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'surname', 'email_address', 'role', 'registered_payment_method','worker_id',]
        read_only_fields = ['id']

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
        # Note: Django's User model handles password hashing
        # For your custom User model, you might need to hash manually
        user = User.objects.create(**validated_data)
        
        # Create user history
        UserHistory.objects.create(
            user=user,
            date_of_registration=validated_data.get('date_of_registration', None),
            number_of_reservations=0
        )
        
        return user

class UserLoginSerializer(serializers.Serializer):
    email_address = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
