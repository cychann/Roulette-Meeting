from django.db import models
import uuid


class Meeting(models.Model):
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    password = models.CharField(max_length=200)