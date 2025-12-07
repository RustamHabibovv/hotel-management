"""
Management command to set default passwords for all users without passwords
"""
from django.core.management.base import BaseCommand
from user.models import User


class Command(BaseCommand):
    help = 'Set default password (password123) for all users without passwords'

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write("Setting passwords for users without passwords")
        self.stdout.write("=" * 60)
        
        users_without_password = User.objects.filter(password__isnull=True) | User.objects.filter(password='')
        
        if not users_without_password.exists():
            self.stdout.write(self.style.SUCCESS("\n✅ All users already have passwords!"))
        else:
            self.stdout.write(f"\nFound {users_without_password.count()} users without passwords:\n")
            
            for user in users_without_password:
                # Set default password as "password123"
                default_password = "password123"
                user.set_password(default_password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Password set for: {user.name} {user.surname} ({user.email_address})")
                )
                self.stdout.write(f"   Default password: {default_password}")
            
            self.stdout.write("\n" + "=" * 60)
            self.stdout.write(self.style.SUCCESS("✅ All users now have passwords!"))
            self.stdout.write("Default password: password123")
            self.stdout.write("Users can login with their email and this password")
            self.stdout.write("=" * 60)
