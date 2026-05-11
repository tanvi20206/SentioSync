from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Signup — naya account banana
    path('signup/', views.SignupView.as_view(), name='signup'),

    # Login — JWT tokens lena
    path('login/', views.LoginView.as_view(), name='login'),

    # Logout — token invalidate karna
    path('logout/', views.LogoutView.as_view(), name='logout'),

    # Profile — dekhna aur update karna
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # Password change
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    # Token refresh — access token expire ho jaaye toh naya lena
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]