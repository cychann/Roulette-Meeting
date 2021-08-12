from django.contrib.auth import views
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path

from accountapp.forms import UserLoginForm
from accountapp.views import (accountCreateView, accountDeleteView,
                              accountDetailView, passwordUpdateView,
                              usernameUpdateView)

app_name = "accountapp"

urlpatterns = [

    # path('login/', LoginView.as_view(
    #     template_name='accountapp/login.html'), name='login'),
    path(
        'login/',
        views.LoginView.as_view(
            template_name="accountapp/login.html",
            authentication_form=UserLoginForm,
        ),
        name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('create/', accountCreateView.as_view(), name='create'),
    path('detail/<int:pk>', accountDetailView.as_view(), name='detail'),
    path('update_password/<int:pk>',
         passwordUpdateView.as_view(), name='update_password'),
    path('update_username/<int:pk>',
         usernameUpdateView.as_view(), name='update_nickname'),
    path('delete/<int:pk>', accountDeleteView.as_view(), name='delete'),

]
