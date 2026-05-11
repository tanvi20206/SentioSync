from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django admin panel — go to http://localhost:8000/admin
    path('admin/', admin.site.urls),

    # Our API routes — all prefixed with /api/
    path('api/accounts/', include('accounts.urls')),     # login, signup, profile
    path('api/sentiment/', include('sentiment.urls')),   # analyse text
    path('api/analytics/', include('analytics.urls')),   # history & reports
]