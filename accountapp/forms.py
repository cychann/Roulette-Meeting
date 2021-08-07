from django.contrib.auth.forms import UserCreationForm
from django import forms


class passwordUpdateForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['username'].disabled = True


class usernameUpdateForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['password1'].disabled = True
        self.fields['password2'].disabled = True
