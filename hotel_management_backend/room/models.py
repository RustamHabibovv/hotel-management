from django.db import models
from hotel.models import Hotel
from reservation.models import Reservation  

class Room(models.Model):
    number = models.IntegerField()
    amenities = models.CharField(max_length=255, blank=True, null=True)
    available = models.BooleanField(default=True)
    maintenance = models.BooleanField(default=False)
    scenery = models.CharField(max_length=255, blank=True, null=True)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)

class ReservationRoom(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

class SpecialRoomRequest(models.Model):
    smoker = models.BooleanField(default=False)
    pets = models.BooleanField(default=False)
    baby = models.BooleanField(default=False)
    disabled_access = models.BooleanField(default=False)
    other = models.CharField(max_length=255, blank=True, null=True)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
