from django.contrib import admin
from django import forms
from .models import User, UserHistory

class UserAdminForm(forms.ModelForm):
    """Custom form to handle password hashing"""
    password = forms.CharField(
        widget=forms.PasswordInput(),
        required=False,
        help_text="Leave blank if not changing password. For new users, set a password."
    )
    
    class Meta:
        model = User
        fields = '__all__'
    
    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get('password')
        if password:
            user.set_password(password)
        if commit:
            user.save()
        return user

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    form = UserAdminForm
    list_display = ['id', 'name', 'surname', 'email_address', 'role']
    search_fields = ['name', 'surname', 'email_address']
    list_filter = ['role']
    
    def save_model(self, request, obj, form, change):
        """Ensure password is hashed when saving through admin"""
        if form.cleaned_data.get('password'):
            obj.set_password(form.cleaned_data['password'])
        obj.save()

@admin.register(UserHistory)
class UserHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'date_of_registration', 'number_of_reservations']
    search_fields = ['user__name', 'user__email_address']
    list_filter = ['date_of_registration']
