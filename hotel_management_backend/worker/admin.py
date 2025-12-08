from django.contrib import admin
from .models import Worker, Task

@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'surname', 'hotel', 'jobs')
    search_fields = ('name', 'surname')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'worker', 'start_datetime', 'end_datetime', 'reserved')
    list_filter = ('worker', 'reserved')
    search_fields = ('name',)
