from django.contrib import admin
from .models import Room, ReservationRoom, SpecialRoomRequest

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'number', 'hotel', 'price', 'available', 'maintenance']
    search_fields = ['number', 'amenities']
    list_filter = ['available', 'maintenance', 'hotel']
    list_editable = ['available', 'maintenance']

@admin.register(ReservationRoom)
class ReservationRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'reservation', 'room']
    search_fields = ['reservation__id', 'room__number']

@admin.register(SpecialRoomRequest)
class SpecialRoomRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'reservation', 'smoker', 'pets', 'baby', 'disabled_access']
    list_filter = ['smoker', 'pets', 'baby', 'disabled_access']
