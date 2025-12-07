from django.contrib import admin
from .models import Hotel

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ['id', 'location', 'number_of_rooms', 'check_in_time', 'check_out_time']
    search_fields = ['location', 'name']
