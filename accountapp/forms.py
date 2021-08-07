from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.forms import ModelForm

from accountapp.models import UserModel


class RegisterForm(UserCreationForm):
    class Meta:
        model = UserModel
        fields = ['username', 'password1',
                  'password2', 'nickname']


class passwordUpdateForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['username'].disabled = True


class usernameUpdateForm(ModelForm):
    class Meta:
        model = UserModel
        fields = ['nickname']

    # def __init__(self, *args, **kwargs):
    #     super().__init__(*args, **kwargs)

    #     self.fields['password1'].disabled = True
    #     self.fields['password2'].disabled = True
