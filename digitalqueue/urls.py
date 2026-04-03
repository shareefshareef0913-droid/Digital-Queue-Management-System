from django.urls import path
from .views import (
    OrganizationList,
    ServiceList,
    RegisterCustomer,
    QueueList,
    CallNextToken,
    CompleteToken,
    CounterList,
    AdminLogin,
    AdminTokenList,
)

urlpatterns = [
    path('organizations/', OrganizationList.as_view(), name='organizations'),
    path('services/', ServiceList.as_view(), name='services'),
    path('register/', RegisterCustomer.as_view(), name='register-customer'),
    path('queue/', QueueList.as_view(), name='queue-list'),
    path('call-next/', CallNextToken.as_view(), name='call-next'),
    path('complete/', CompleteToken.as_view(), name='complete-service'),
    path('counters/', CounterList.as_view(), name='counters'),
    path('admin-login/', AdminLogin.as_view(), name='admin-login'),
    path('admin-tokens/', AdminTokenList.as_view(), name='admin-tokens'),
]
