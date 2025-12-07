from django.db import models
from user.models import User, UserHistory

class Reservation(models.Model):
    """
    Reservation model - matches UML diagram exactly.
    Fields: Date, Hour, Number of Guests, Price, Duration
    Relationships: User (makes), User History (logs)
    Note: Room relationship is handled through ReservationRoom in room app
    """
    # Core fields from UML diagram
    date = models.DateField()
    hour = models.IntegerField(blank=True, null=True)
    number_of_guests = models.IntegerField()
    price = models.FloatField()
    duration = models.FloatField()
    
    # Relationships from UML diagram
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    user_history = models.ForeignKey(UserHistory, on_delete=models.CASCADE)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Reservation #{self.id} - {self.user.name} on {self.date}"
