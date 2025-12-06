from django.db import models

class User(models.Model):
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    registered_payment_method = models.CharField(max_length=255, blank=True, null=True)
    email_address = models.EmailField(unique=True)
    role = models.CharField(max_length=50, blank=True, null=True)

class UserHistory(models.Model):
    date_of_registration = models.DateField()
    number_of_reservations = models.IntegerField(default=0)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
