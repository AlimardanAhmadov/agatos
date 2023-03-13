from django.urls import path
from . import views


urlpatterns = [
    path('sign-up', views.RegisterAPIView.as_view(), name='sign_up'),
    path('sign-in', views.LoginAPIView.as_view(), name='sign_in'),
    path('profile', views.UpdatePesonalInfoView.as_view(), name='profile'),
    path('change-password', views.ChangePasswordView.as_view(), name='change_password'),
    path('generate-qr', views.GenerateQRView.as_view(), name='generate_qr_code'),
    path('profile/preview/<str:username>', views.ProfilePreviewView.as_view(), name='profile_preview'),
    path('logout', views.LogoutView.as_view(), name='logout'),
]