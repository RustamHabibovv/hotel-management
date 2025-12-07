from django.db import models
from hotel.models import Hotel

class Worker(models.Model):
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    contracts = models.CharField(max_length=255, blank=True, null=True)
    jobs = models.CharField(max_length=255, blank=True, null=True)
    contact_info = models.CharField(max_length=255, blank=True, null=True)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
