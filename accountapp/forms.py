from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.forms import ModelForm
from django.utils.translation import gettext, gettext_lazy as _

from accountapp.models import UserModel


class RegisterForm(UserCreationForm):
    password1 = forms.CharField(
        label="비밀번호",
        strip=False,
        widget=forms.PasswordInput(attrs={
            'placeholder': '비밀번호 입력(영문,숫자 조합 최소 8자)'
        }),
    )
    password2 = forms.CharField(
        label="비밀번호 확인",
        strip=False,
        widget=forms.PasswordInput,
    )

    class Meta:
        model = UserModel
        fields = ['username', 'password1',
                  'password2', 'nickname']
        labels = {
            'username': '아이디',
            'nickname': '닉네임',
        }
        widgets = {
            'username': forms.TextInput(
                attrs={
                    'placeholder': '아이디 입력(5자~10자)'
                }
            ),
        }


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
