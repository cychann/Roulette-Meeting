from django.urls import path

from . import views

app_name = "meeting"

urlpatterns = [
    path('', views.index, name='index'),
    path('cmeeting/', views.create_meeting, name='create'),
]
