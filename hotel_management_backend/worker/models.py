from django.db import models
from user.models import User
from hotel.models import Hotel


class Worker(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    contracts = models.CharField(max_length=255, blank=True, null=True)
    jobs = models.CharField(max_length=255, blank=True, null=True)
    contact_info = models.CharField(max_length=255, blank=True, null=True)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} {self.surname}"


class Task(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(blank=True, null=True)
    start_datetime = models.DateTimeField(blank=True, null=True)
    end_datetime = models.DateTimeField(blank=True, null=True)
    reserved = models.BooleanField(default=False)
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return self.name or f"Task {self.id}"