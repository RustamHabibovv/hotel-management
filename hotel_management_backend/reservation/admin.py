from django.contrib import admin
from .models import Reservation

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'date', 'number_of_guests', 'price', 'duration']
    search_fields = ['user__name', 'user__email_address']
    list_filter = ['date']
    date_hierarchy = 'date'
    raw_id_fields = ['user', 'user_history']
