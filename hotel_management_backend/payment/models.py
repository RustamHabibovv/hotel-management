from django.db import models
from reservation.models import Reservation

from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

class Bill(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    amount = models.FloatField()
    room = models.IntegerField()
    due_date = models.DateField(default=date.today() + relativedelta(months=1))
    taxes = models.FloatField(default=21.0)
    status = models.CharField(max_length=20, default="Unpaid")

class Payment(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE)
    amount = models.FloatField()
    type = models.CharField(max_length=50)
    date = models.DateField()
    state = models.BooleanField(default=False)
