"""
URL configuration for hotel_management_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from payment.views import BillViewSet, PaymentViewSet
from reservation.views import ReservationViewSet
from room.views import RoomViewSet

router = routers.DefaultRouter()
router.register(r'reservations', ReservationViewSet)
router.register(r'bills', BillViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'rooms', RoomViewSet)

from user.views import custom_login, get_current_user, register

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path("api/worker/", include("worker.urls")),
    
    # JWT Authentication endpoints
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Custom authentication
    path('api/auth/custom-login/', custom_login, name='custom_login'),
    path('api/auth/register/', register, name='register'),
    path('api/auth/me/', get_current_user, name='current_user'),
]