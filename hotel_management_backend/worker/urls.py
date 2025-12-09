from django.urls import path
from .views import (
    WorkerListCreateView,
    WorkerDetailView,
    TaskListCreateView,
    TaskDetailView,
    TaskCalendarView,
    google_login,
    google_callback
)

urlpatterns = [
    # Worker endpoints
    path('workers/', WorkerListCreateView.as_view(), name='worker-list-create'),
    path('workers/<int:pk>/', WorkerDetailView.as_view(), name='worker-detail'),
    
    # Task endpoints
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    
    # Calendar endpoint
    path('tasks/calendar/', TaskCalendarView.as_view(), name='task-calendar'),

    # Google
    path('google/login/', google_login, name='google_login'),
    path('google/callback/', google_callback, name='google_callback'),
]