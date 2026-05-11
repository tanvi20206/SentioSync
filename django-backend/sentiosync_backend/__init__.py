# This makes sure the Celery app is always imported when
# Django starts, so the @shared_task decorator works correctly.
from .celery import app as celery_app

__all__ = ('celery_app',)