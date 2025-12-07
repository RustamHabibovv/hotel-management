from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class User(models.Model):
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    registered_payment_method = models.CharField(max_length=255, blank=True, null=True)
    email_address = models.EmailField(unique=True)
    password = models.CharField(max_length=255, blank=True, null=True)  # Hashed password (nullable for existing users)
    role = models.CharField(max_length=50, blank=True, null=True)
    
    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check if the provided password is correct"""
        return check_password(raw_password, self.password)
    
    @property
    def is_authenticated(self):
        """
        Always return True. This is a way to tell if the user has been authenticated.
        """
        return True
    
    @property
    def is_anonymous(self):
        """
        Always return False. This is a way to tell if the user is anonymous.
        """
        return False

class UserHistory(models.Model):
    date_of_registration = models.DateField()
    number_of_reservations = models.IntegerField(default=0)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
