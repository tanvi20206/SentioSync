from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    """
    Signup ke liye — user se email, username, password lena
    """
    password = serializers.CharField(
        write_only=True,        # password response mein kabhi nahi aayega
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2']

    def validate(self, attrs):
        # Check karo ki dono passwords match karte hain
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Passwords did not match."}
            )
        return attrs

    def create(self, validated_data):
        # password2 ko hata do — DB mein save nahi hoga
        validated_data.pop('password2')

        # User banao — create_user automatically password hash karta hai
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Login ke liye — sirf email aur password
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Profile dikhane ke liye — sensitive data nahi dikhayenge
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'bio', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']


class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    Profile update karne ke liye
    """
    class Meta:
        model = User
        fields = ['username', 'bio']