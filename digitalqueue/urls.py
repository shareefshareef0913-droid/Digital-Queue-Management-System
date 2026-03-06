from django.urls import path
from .views import (
    OrganizationList,
    ServiceList,
    RegisterCustomer,
    QueueList,
    CallNextToken,
    CompleteToken
)

urlpatterns = [

    # Get all organizations
    path('organizations/', OrganizationList.as_view(), name='organizations'),

    # Get services based on selected organization
    path('services/', ServiceList.as_view(), name='services'),

    # Register customer and generate token
    path('register/', RegisterCustomer.as_view(), name='register-customer'),

    # View waiting queue
    path('queue/', QueueList.as_view(), name='queue-list'),

    # Operator calls next token
    path('call-next/', CallNextToken.as_view(), name='call-next'),

    # Complete service
    path('complete/', CompleteToken.as_view(), name='complete-service'),
]