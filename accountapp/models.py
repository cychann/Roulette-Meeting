from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.


class UserModel(AbstractUser):
    nickname = models.CharField(max_length=15)
