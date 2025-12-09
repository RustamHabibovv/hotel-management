from rest_framework import serializers
from .models import Bill, Payment

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = '__all__'
        extra_kwargs = {
            'reservation': {'required': False, 'allow_null': True}
        }

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
