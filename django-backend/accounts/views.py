from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from .serializers import (
    SignupSerializer,
    LoginSerializer,
    UserProfileSerializer,
    UpdateProfileSerializer
)

User = get_user_model()


def get_tokens_for_user(user):
    """
    User ke liye JWT access + refresh token generate karo.
    Ye helper function hai — views mein use hoga.
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class SignupView(APIView):
    """
    POST /api/accounts/signup/
    Koi bhi signup kar sakta hai — isliye AllowAny
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)

            return Response({
                'message': 'Account created successfully!',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                },
                'tokens': tokens   # login ke liye seedha tokens de do
            }, status=status.HTTP_201_CREATED)

        # Validation errors — jaise email already exists
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/accounts/login/
    Email + password bhejo, JWT tokens milenge
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            # Django ka authenticate — email/password check karta hai
            user = authenticate(request, username=email, password=password)

            if user is not None:
                if user.is_active:
                    tokens = get_tokens_for_user(user)
                    return Response({
                        'message': 'Login successful!',
                        'user': {
                            'id': user.id,
                            'email': user.email,
                            'username': user.username,
                        },
                        'tokens': tokens
                    }, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {'error': 'Account is disabled.'},
                        status=status.HTTP_403_FORBIDDEN
                    )

            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    POST /api/accounts/logout/
    Refresh token ko blacklist karo — token invalid ho jaayega
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()   # token ko permanently invalid karo

            return Response(
                {'message': 'Logged out successfully!'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(APIView):
    """
    GET  /api/accounts/profile/  → profile dekho
    PUT  /api/accounts/profile/  → profile update karo
    """
    permission_classes = [IsAuthenticated]  # login hona zaroori hai

    def get(self, request):
        # request.user automatically logged-in user hai (JWT se aata hai)
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True   # partial=True matlab saare fields zaroori nahi
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully!',
                'user': serializer.data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    POST /api/accounts/change-password/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Password changed successfully! Please login again.'},
            status=status.HTTP_200_OK
        )