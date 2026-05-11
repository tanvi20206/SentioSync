from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model — we extend Django's built-in User
    so we can add extra fields later without breaking anything.
    """
    email = models.EmailField(unique=True)       # email must be unique
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email to login instead of username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']   # still required but not used for login

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'