from django.db import models

class Hotel(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    number_of_rooms = models.IntegerField(blank=True, null=True)
    check_in_time = models.IntegerField(blank=True, null=True)
    check_out_time = models.IntegerField(blank=True, null=True)
