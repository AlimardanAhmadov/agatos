from django.contrib.auth import get_user_model, authenticate
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers, exceptions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_auth.registration.serializers import RegisterSerializer

from allauth.account.models import EmailAddress

import base64
import io
import qrcode
import qrcode.image.svg

from main.models import EmployeeCard

User = get_user_model()


class CustomRegisterSerializer(RegisterSerializer):
    email = serializers.EmailField(required=True, write_only=True)

    def __init__(self, *args, **kwargs):
        super(CustomRegisterSerializer, self).__init__(*args, **kwargs)
        
        self.request = self.context.get("request")

    def get_cleaned_data_profile(self):
        return {
            "email": self.validated_data.get("email", ""),
            "username": self.validated_data.get("username", ""),
        }

    def create_profile(self, user, validated_data):
        user.email = self.validated_data.get("email")
        user.username = self.validated_data.get("email")
        user.save()

        token = RefreshToken.for_user(user)
        token = {
            "refresh_token": str(token),
            "access_token": str(token.access_token)
        }

        EmployeeCard.objects.create(
            user=user,
        )
    
    def custom_signup(self, request, user):
        self.create_profile(user, self.get_cleaned_data_profile())

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password"
        ]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(style={"input_type": "password"})

    def authenticate(self, **kwargs):
        return authenticate(self.context["request"], **kwargs)

    def _validate_email(self, email, password):
        user = None

        if email and password:
            user = self.authenticate(email=email, password=password)
        else:
            msg = _('Must include "username" and "password".')
            raise exceptions.ValidationError(msg)

        return user

    def _validate_username(self, username, password):
        user = None

        if username and password:
            user = self.authenticate(username=username, password=password)
        else:
            msg = _(
                'Must include "username or "email" and "password".'
            )
            raise exceptions.ValidationError(msg)

        return user

    def _validate_username_email(self, username, email, password):
        user = None

        if email and password:
            user = self.authenticate(email=email, password=password)
        elif username and password:
            user = self.authenticate(username=username, password=password)
        else:
            msg = _(
                'Must include either "username" or "email" and "password".'
            )
            raise exceptions.ValidationError(msg)

        return user

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = None

        if username:
            user = self._validate_username_email(username, "", password)

        if user:
            if not user.is_active:
                msg = _("User account is inactive.")
                raise exceptions.ValidationError(msg)
        else:
            msg = _("please check your username or password.")
            raise exceptions.ValidationError(msg)

        if "rest_auth.registration" in settings.INSTALLED_APPS:
            from allauth.account import app_settings

            if (
                app_settings.EMAIL_VERIFICATION
                == app_settings.EmailVerificationMethod.MANDATORY
            ):
                try:
                    email_address = user.emailaddress_set.get(email=user.email)
                except EmailAddress.DoesNotExist:
                    raise serializers.ValidationError(
                        _(
                            "This account doesn't have an E-mail address!, so that you can't login."
                        )
                    )
                if not email_address.verified:
                    raise serializers.ValidationError(_("E-mail is not verified."))

        attrs["user"] = user
        return attrs


class UpdateBusinessCardSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", required=True)
    last_name = serializers.CharField(source="user.last_name", required=True)
    username = serializers.CharField(source="user.username", required=True)
    email = serializers.CharField(source="user.email", required=True)

    class Meta:
        model = EmployeeCard
        fields = (
            "position",
            "since",
            "location",
            "encoded_image",
            "first_name",
            "last_name",
            "username",
            "email"
        )

        extra_kwargs = {
            'position': {'required': False},
            'since': {'required': False,},
            'location': {'required': False,},
            'encoded_image': {'required': False,},
        }

    def update(self, instance, validated_data):
        profile_data = validated_data
        user_data = validated_data.pop('user')
        user = instance.user

        # * User Info
        user.first_name = validated_data.get(
            'first_name', user_data['first_name'])
        user.last_name = validated_data.get(
            'last_name', user_data['last_name'])
        user.email = validated_data.get(
            'email', user_data['email'])
        user.username = validated_data.get(
            'username', user_data['username'])
        user.save()

        # * Employee Info
        instance.position = profile_data.get(
            'position', instance.position)
        instance.since = profile_data.get(
            'since', instance.since)
        instance.location = profile_data.get(
            'location', instance.location)
        instance.encoded_image = profile_data.get(
            'encoded_image', instance.encoded_image)
        instance.save()

        return instance


class ChangePasswordSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'old_password',
            'password', 
            'password2',
        )

    set_password_form_class = SetPasswordForm

    def __init__(self, *args, **kwargs):
        self.old_password_field_enabled = getattr(
            settings, "OLD_PASSWORD_FIELD_ENABLED", False
        )
        self.logout_on_password_change = getattr(
            settings, "LOGOUT_ON_PASSWORD_CHANGE", False
        )
        super(ChangePasswordSerializer, self).__init__(*args, **kwargs)

        self.request = self.context.get("request")
        self.user = getattr(self.request, "user", None)

    def validate_old_password(self, value): 
        invalid_password_conditions = (
            self.user,
            not self.user.check_password(value),
        )

        if all(invalid_password_conditions):
            raise serializers.ValidationError("Invalid password")
        return value

    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": 'Password fields did not match.'})
      
        
        old_password_match = (
            attrs["old_password"] == attrs["password"],
        )

        if all(old_password_match):
            raise serializers.ValidationError(
                {"password": 'your new password matching with old password'}
            )
        
        return attrs


class QRCodeSerializer(serializers.Serializer):
    def __init__(self, *args, **kwargs):
        super(QRCodeSerializer, self).__init__(*args, **kwargs)

        self.url = self.context.get("url")

    class Meta:
        model = EmployeeCard
        fields = (
            'encoded_qr_qode',
        )

    def update(self, instance, validated_data):
        employee_card = instance.employee
        # factory = qrcode.image.svg.SvgImage

        img = qrcode.make(
            self.url, 
            box_size=20
        )
        converted_img = img.convert('RGB')

        stream = io.BytesIO()
        converted_img.save(stream, 'JPEG')

        encoded_img = base64.b64encode(stream.getvalue())
        decoded_img = encoded_img.decode('utf-8')
        img_data = f"data:image/jpeg;base64,{decoded_img}"
        # * Employee Info
        employee_card.encoded_qr_qode = img_data
        employee_card.save()

        return employee_card