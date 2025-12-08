from django.urls import path
from .views import online_bank_payment

urlpatterns = [
    path('online-bank-payments/', online_bank_payment, name='online-bank-payment'),
]
