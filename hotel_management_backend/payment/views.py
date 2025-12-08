from rest_framework import viewsets
from .models import Bill, Payment
from .serializers import BillSerializer, PaymentSerializer
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

@api_view(['POST'])
def online_bank_payment(request):
    data = request.data
    # Send data to Postman mock API
    res = requests.post('https://c5b3965f-34a1-4307-a466-f7b87f20cb7f.mock.pstmn.io/payments', json=data)
    return Response(res.json())    
