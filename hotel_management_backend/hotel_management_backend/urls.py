from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from payment.views import BillViewSet, PaymentViewSet
from reservation.views import ReservationViewSet
from room.views import RoomViewSet
from user.views import UserViewSet, custom_login, register, get_current_user

router = routers.DefaultRouter()
router.register(r"reservations", ReservationViewSet)
router.register(r"bills", BillViewSet)
router.register(r"payments", PaymentViewSet)
router.register(r"rooms", RoomViewSet)
router.register(r"users", UserViewSet, basename="users")  # <-- correct place

urlpatterns = [
    path("admin/", admin.site.urls),

    # All API viewsets
    path("api/", include(router.urls)),

    # JWT authentication
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Custom authentication
    path("api/auth/custom-login/", custom_login, name="custom_login"),
    path("api/auth/register/", register, name="register"),
    path("api/auth/me/", get_current_user, name="current_user"),
]
