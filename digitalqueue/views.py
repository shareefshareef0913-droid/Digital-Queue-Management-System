from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import date
from .models import Organization, Service, Customer, Counter, Token
from .serializers import (OrganizationSerializer,ServiceSerializer, CustomerSerializer,
    TokenSerializer
)
class OrganizationList(APIView):
    def get(self, request):
        organizations = Organization.objects.all()
        serializer = OrganizationSerializer(organizations, many=True )
        return Response( serializer.data, status=status.HTTP_200_OK )
class ServiceList(APIView):
    def get(self, request):
        organization_id = request.GET.get("organization")
        if not organization_id:
            return Response(
                {"error": "organization id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        services = Service.objects.filter(
            organization_id=organization_id
        )
        serializer = ServiceSerializer(  services,many=True  )
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
class RegisterCustomer(APIView):

    def post(self, request):

        serializer = CustomerSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # save customer
        customer = serializer.save()

        service_id = request.data.get("service")

        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            return Response(
                {"error": "Service not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # generate token number
        today = date.today()

        token_count = Token.objects.filter(
            service=service,
            created_at__date=today
        ).count() + 1

        token_number = f"{service.service_name[:2].upper()}{token_count}"

        # create token
        token = Token.objects.create(
            token_number=token_number,
            customer=customer,
            service=service,
            organization=service.organization
        )

        return Response(
            {
                "message": "Token generated successfully",
                "token": token.token_number
            },
            status=status.HTTP_201_CREATED
        )
class QueueList(APIView):

    def get(self, request):

        tokens = Token.objects.filter(
            status="waiting"
        ).order_by("created_at")

        serializer = TokenSerializer(
            tokens,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
class CallNextToken(APIView):

    def post(self, request):

        counter_id = request.data.get("counter")

        token = Token.objects.filter(
            status="waiting"
        ).first()

        if not token:
            return Response(
                {"message": "No tokens in queue"},
                status=status.HTTP_404_NOT_FOUND
            )

        token.status = "serving"
        token.counter_id = counter_id
        token.served_at = timezone.now()

        token.save()

        return Response(
            {
                "message": "Next token called",
                "token": token.token_number,
                "counter": counter_id
            },
            status=status.HTTP_200_OK
        )
class CompleteToken(APIView):

    def post(self, request):

        token_id = request.data.get("token")

        try:
            token = Token.objects.get(id=token_id)
        except Token.DoesNotExist:
            return Response(
                {"error": "Token not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        token.status = "completed"
        token.completed_at = timezone.now()

        token.save()

        return Response(
            {"message": "Service completed"},
            status=status.HTTP_200_OK
        )


