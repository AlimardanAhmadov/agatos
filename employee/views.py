import json, re
from django.views.decorators.debug import sensitive_post_parameters
from django.utils.decorators import method_decorator
from django.db import transaction
from django.db import models
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import get_user_model, logout
from django.contrib.auth.decorators import login_required 
from django.contrib.sites.shortcuts import get_current_site

from rest_framework.generics import (ListCreateAPIView, )
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import (BlacklistedToken,
                                                             OutstandingToken)

from rest_auth.app_settings import JWTSerializer
from rest_auth.utils import jwt_encode 
from rest_auth.views import LoginView, APIView

from .renderer_class import MyHTMLRenderer
from .serializers import ChangePasswordSerializer, CustomRegisterSerializer, LoginSerializer, QRCodeSerializer, UpdateBusinessCardSerializer, UserSerializer

from main.models import EmployeeCard

sensitive_post_parameters_m = method_decorator(
    sensitive_post_parameters("password1", "password2")
)

User = get_user_model()

class RegisterAPIView(ListCreateAPIView):
    renderer_classes = [MyHTMLRenderer,]
    template_name = 'user/signup.html'
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = CustomRegisterSerializer
    
    
    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super(RegisterAPIView, self).dispatch(*args, **kwargs)

    def get(self, request, format=None):
        users = User.objects.all()
        serializer = CustomRegisterSerializer(users, many=True)
        return Response(serializer.data)

    def get_serializer(self, *args, **kwargs):
        return CustomRegisterSerializer(*args, **kwargs)

    def get_response_data(self, user):
        data = {"user": user, "token": self.token}
        return JWTSerializer(data).data

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context = {'request': request})
        if serializer.is_valid():
            user = self.perform_create(serializer)
            if getattr(settings, "REST_USE_JWT", False):
                self.token = jwt_encode(user)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        else:
            data = []
            data_keys = []
            emessage=serializer.errors
            for key in emessage:
                err_message = str(emessage[key])
                err_string = re.search("string=(.*), code", err_message)
                message_value = err_string.group(1)
                final_message = f"{key} - {message_value}"
                data.append(final_message)
                data_keys.append(key)

            response = HttpResponse(json.dumps({'error': data, 'error_keys': data_keys}), 
                content_type='application/json')
            response.status_code = 400
            return response

    def perform_create(self, serializer):
        user = serializer.save(self.request)
        return user


class LoginAPIView(LoginView):
    queryset = ""
    renderer_classes = [MyHTMLRenderer,]
    template_name = "user/login.html"
    allowed_methods = ("POST", "OPTIONS", "HEAD", "GET")

    # @method_decorator(cache_page(60 * 15))
    def dispatch(self, *args, **kwargs):
        return super(LoginAPIView, self).dispatch(*args, **kwargs)

    def get(self, request):
        users = User.objects.all()
        serializer = LoginSerializer(users, many=True)
        return Response(serializer.data)

    def get_response(self, request):
        serializer_class = self.get_response_serializer()
        if getattr(settings, "REST_USE_JWT", False):
            data = {"user": self.user, "token": self.token}
            serializer = serializer_class(
                instance=data, context={"request": self.request}
            )
        else:
            serializer = serializer_class(
                instance=self.token, context={"request": self.request}
            )

        token = RefreshToken.for_user(self.user)
        context = {
            'data': serializer.data,
            'status': status.HTTP_200_OK,
            "refresh_token": str(token),
            "access_token": str(token.access_token)
        }
        response = JsonResponse(context)

        return response

    def post(self, request, *args, **kwargs):
        self.request = request
        self.serializer = self.get_serializer(
            data=self.request.data, context={"request": request}
        )
        if self.serializer.is_valid():
            self.login()
        else:
            data = []
            emessage=self.serializer.errors
            for key in emessage:
                err_message = str(emessage[key])
                err_string = re.search("string=(.*), ", err_message) 
                message_value = err_string.group(1)
                final_message = f"{key} - {message_value}"
                data.append(final_message)

            response = HttpResponse(json.dumps({'error': data}), 
                content_type='application/json')
            response.status_code = 400
            return response
        return self.get_response(request)


class UpdatePesonalInfoView(ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    template_name = 'user/edit_profile.html'
    renderer_classes = [MyHTMLRenderer,]
    serializer_class = UpdateBusinessCardSerializer

    
    @method_decorator(login_required(login_url='/employee/sign-in'))
    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super(UpdatePesonalInfoView, self).dispatch(*args, **kwargs)

    def get(self, request, format=None):
        employee = request.user.employee
        serializer = UpdateBusinessCardSerializer(employee, context={'request': request})
        return Response({'data': serializer.data, 'current_site': 'https://{}'.format(get_current_site(self.request).domain)})

    def get_serializer(self, *args, **kwargs):
        return UpdateBusinessCardSerializer(*args, **kwargs)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            try:
                employee = request.user.employee
                serializer = UpdateBusinessCardSerializer(employee, data=request.data, context={'request': request})
                if serializer.is_valid():
                    serializer.save()
                    return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    transaction.set_rollback(True)
                    data = []
                    emessage=serializer.errors 
                    for key in emessage:
                        err_message = str(emessage[key])
                        err_string = re.search("string='(.*)', ", err_message) 
                        message_value = err_string.group(1)
                        final_message = f"{key} - {message_value}"
                        data.append(final_message)

                    response = HttpResponse(json.dumps({'err': data}), 
                        content_type='application/json')
                    response.status_code = 400
                    return response
            except Exception as exc:
                transaction.set_rollback(True)
                response = HttpResponse(json.dumps({'err': ['Something went wrong']}), 
                    content_type='application/json')
                response.status_code = 400
                return response


class ChangePasswordView(ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    @method_decorator(login_required(login_url='/employee/sign-in'))
    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super(ChangePasswordView, self).dispatch(*args, **kwargs)
    
    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super(ChangePasswordView, self).dispatch(*args, **kwargs)

    def get(self, request, format=None):
        user = self.request.user
        serializer = ChangePasswordSerializer(user, context={'request': request})
        return Response(data=serializer.data)

    def get_serializer(self, *args, **kwargs):
        return ChangePasswordSerializer(*args, **kwargs)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            try:
                user = self.request.user
                serializer = ChangePasswordSerializer(user, data=request.data, context={'request': request})
                if serializer.is_valid():
                    user.set_password(request.data.get("password"))
                    user.save()
                    return JsonResponse(serializer.data, status=status.HTTP_200_OK)
                else:
                    data = []
                    emessage=serializer.errors 
                    for key in emessage:
                        err_message = str(emessage[key])
                        err_string = re.search("string='(.*)', ", err_message) 
                        message_value = err_string.group(1)
                        final_message = f"{key} - {message_value}"
                        data.append(final_message)

                    response = HttpResponse(json.dumps({'err': data}),
                        content_type='application/json')
                    response.status_code = 400
                    return response

            except Exception as exc:
                transaction.set_rollback(True)
                response = HttpResponse(json.dumps({'err': ["Something went wrong"]}), 
                    content_type='application/json')
                response.status_code = 400
                return response


class GenerateQRView(ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = QRCodeSerializer

    @method_decorator(login_required(login_url='/employee/sign-in'))
    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super(GenerateQRView, self).dispatch(*args, **kwargs)
    
    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super(GenerateQRView, self).dispatch(*args, **kwargs)

    def get(self, request, format=None):
        user = self.request.user
        serializer = QRCodeSerializer(user, context={'request': request})
        return Response(data=serializer.data)

    def get_serializer(self, *args, **kwargs):
        return QRCodeSerializer(*args, **kwargs)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            try:
                user = self.request.user
                serializer = QRCodeSerializer(user, data=request.data, context={'request': request, 'url': request.data['url']})
                if serializer.is_valid():
                    serializer.save()
                    return JsonResponse(serializer.data, status=status.HTTP_200_OK)
                else:
                    data = []
                    emessage=serializer.errors 
                    for key in emessage:
                        err_message = str(emessage[key])
                        err_string = re.search("string='(.*)', ", err_message) 
                        message_value = err_string.group(1)
                        final_message = f"{key} - {message_value}"
                        data.append(final_message)

                    response = HttpResponse(json.dumps({'err': data}),
                        content_type='application/json')
                    response.status_code = 400
                    return response

            except Exception as exc:
                transaction.set_rollback(True)
                response = HttpResponse(json.dumps({'err': ["Something went wrong"]}), 
                    content_type='application/json')
                response.status_code = 400
                return response



class ProfilePreviewView(APIView):
    template_name = 'user/preview_profile.html'
    renderer_classes = [MyHTMLRenderer,]
    permission_classes = (permissions.AllowAny,)

    def dispatch(self, *args, **kwargs):
        return super(ProfilePreviewView, self).dispatch(*args, **kwargs)

    def get(self, request, username, *args, **kwargs):
        current_user = EmployeeCard.cache_by_username(username)

        if current_user is None:
            current_user = EmployeeCard.objects.filter(models.Q(user__username=username)).first()

        context = {
            'current_user': current_user,
            'status': status.HTTP_200_OK
        }
        return Response(context)


class LogoutView(ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer
    allowed_methods = ('POST',)
    queryset = ""


    def post(self, request, *args, **kwargs):
        try:
            if self.request.data.get('all'):
                token: OutstandingToken
                for token in OutstandingToken.objects.filter(user=request.user):
                    _, _ = BlacklistedToken.objects.get_or_create(token=token)
                return Response({"status": "OK, goodbye, all refresh tokens blacklisted"})
            
            refresh_token = self.request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()

            logout(request)
            return Response({"status": "OK, goodbye"})
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)