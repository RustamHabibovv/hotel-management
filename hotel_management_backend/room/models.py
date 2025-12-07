from django.db import models
from hotel.models import Hotel

class Room(models.Model):
    number = models.IntegerField()
    amenities = models.CharField(max_length=255, blank=True, null=True)
    available = models.BooleanField(default=True)
    maintenance = models.BooleanField(default=False)
    scenery = models.CharField(max_length=255, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)  # Price per night
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"Room {self.number}"

class ReservationRoom(models.Model):
    reservation = models.ForeignKey('reservation.Reservation', on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

class SpecialRoomRequest(models.Model):
    smoker = models.BooleanField(default=False)
    pets = models.BooleanField(default=False)
    baby = models.BooleanField(default=False)
    disabled_access = models.BooleanField(default=False)
    other = models.CharField(max_length=255, blank=True, null=True)
    reservation = models.ForeignKey('reservation.Reservation', on_delete=models.CASCADE)
