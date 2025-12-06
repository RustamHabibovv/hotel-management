# Fill first rows in the database with test data

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotel_management_backend.settings')
django.setup()

from hotel.models import Hotel
from worker.models import Worker
from user.models import User, UserHistory
from reservation.models import Reservation
from room.models import Room, ReservationRoom, SpecialRoomRequest
from payment.models import Bill, Payment
from datetime import date

print("Starting database seeding...")

# 1. HOTEL
hotel = Hotel.objects.create(
    name="Grand Test Hotel",
    location="Test City",
    number_of_rooms=50,
    check_in_time=14,
    check_out_time=11
)
print("✔ Created Hotel")

# 2. WORKER
worker = Worker.objects.create(
    name="Alice",
    surname="Smith",
    contracts="Full-time",
    jobs="Receptionist",
    contact_info="alice@example.com",
    hotel=hotel
)
print("✔ Created Worker")

# 3. USER
user = User.objects.create(
    name="John",
    surname="Doe",
    registered_payment_method="Card",
    email_address="john@example.com",
    role="guest"
)
print("✔ Created User")

# 4. USER HISTORY (OneToOne)
history = UserHistory.objects.create(
    date_of_registration=date(2025, 1, 1),
    number_of_reservations=1,
    user=user
)
print("✔ Created UserHistory")

# 5. ROOM
room = Room.objects.create(
    number=101,
    amenities="WiFi, TV, AC",
    available=True,
    maintenance=False,
    scenery="Sea View",
    hotel=hotel
)
print("✔ Created Room")

# 6. RESERVATION
reservation = Reservation.objects.create(
    date=date(2025, 1, 10),
    hour=15,
    number_of_guests=2,
    price=200.0,
    duration=3.0,
    user=user,
    user_history=history
)
print("✔ Created Reservation")

# 7. RESERVATION-ROOM link
ReservationRoom.objects.create(
    reservation=reservation,
    room=room
)
print("✔ Created ReservationRoom")

# 8. SPECIAL ROOM REQUEST
SpecialRoomRequest.objects.create(
    smoker=False,
    pets=True,
    baby=False,
    disabled_access=False,
    other="High floor",
    reservation=reservation
)
print("✔ Created SpecialRoomRequest")

# 9. BILL
bill = Bill.objects.create(
    reservation=reservation,
    name="John Doe",
    amount=200.0,
    room=room.number,
    due_date=date(2025, 1, 15),
    taxes=20.0,
    status="Unpaid"
)
print("✔ Created Bill")

# 10. PAYMENT
Payment.objects.create(
    bill=bill,
    amount=200.0,
    type="card",
    date=date(2025, 1, 15),
    state=True
)
print("✔ Created Payment")

print("\n🎉 Database seeding completed successfully!")
