"""
Management command to set password for a user
Usage: python manage.py setpassword user@email.com newpassword
"""
from django.core.management.base import BaseCommand
from user.models import User


class Command(BaseCommand):
    help = 'Set password for a user by email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='User email address')
        parser.add_argument('password', type=str, help='New password')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']

        try:
            user = User.objects.get(email_address=email)
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'✅ Password set successfully for {user.name} {user.surname} ({email})')
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ User with email {email} does not exist')
            )
