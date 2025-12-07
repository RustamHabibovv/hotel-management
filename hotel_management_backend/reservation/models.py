from django.db import models
from user.models import User, UserHistory

class Reservation(models.Model):
    date = models.DateField()
    hour = models.IntegerField(blank=True, null=True)
    number_of_guests = models.IntegerField()
    price = models.FloatField()
    duration = models.FloatField()
    user_history = models.ForeignKey(UserHistory, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
