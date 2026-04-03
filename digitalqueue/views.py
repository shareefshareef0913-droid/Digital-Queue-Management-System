from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.contrib.auth import authenticate
from datetime import date
from .models import Organization, Service, Customer, Counter, Token
from .serializers import (OrganizationSerializer, ServiceSerializer, CustomerSerializer,
    TokenSerializer, CounterSerializer, AdminTokenSerializer
)

class OrganizationList(APIView):
    def get(self, request):
        organizations = Organization.objects.all()
        serializer = OrganizationSerializer(organizations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ServiceList(APIView):
    def get(self, request):
        organization_id = request.GET.get("organization")
        if not organization_id:
            return Response(
                {"error": "organization id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        services = Service.objects.filter(organization_id=organization_id)
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RegisterCustomer(APIView):
    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        customer = serializer.save()
        service_id = request.data.get("service")

        if not service_id:
            return Response({"error": "Service id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

        token_count = Token.objects.filter(service=service).count() + 1
        token_number = f"{service.service_name[:2].upper()}{token_count}"

        token = Token.objects.create(
            token_number=token_number,
            customer=customer,
            service=service,
            organization=service.organization
        )

        return Response(
            {
                "message": "Token generated successfully",
                "token": token.token_number,
                "token_id": token.id,
                "organization_id": service.organization.id,
            },
            status=status.HTTP_201_CREATED
        )

class QueueList(APIView):
    def get(self, request):
        org_id = request.GET.get("organization")

        serving_qs = Token.objects.filter(status="serving")
        waiting_qs = Token.objects.filter(status="waiting").order_by("created_at")

        if org_id:
            serving_qs = serving_qs.filter(organization_id=org_id)
            waiting_qs = waiting_qs.filter(organization_id=org_id)

        serving = serving_qs.order_by("served_at").first()

        data = {
            "serving": TokenSerializer(serving).data if serving else None,
            "waiting": TokenSerializer(waiting_qs, many=True).data
        }
        return Response(data, status=status.HTTP_200_OK)

class CallNextToken(APIView):
    def post(self, request):
        counter_id = request.data.get("counter")
        organization_id = request.data.get("organization")

        if counter_id:
            active = Token.objects.filter(counter_id=counter_id, status="serving").first()
            if active:
                return Response(
                    {"message": "Finish current token first"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Mark any currently serving token for this org as completed
        Token.objects.filter(
            organization_id=organization_id,
            status="serving"
        ).update(status="completed", completed_at=timezone.now())

        token = Token.objects.filter(
            status="waiting",
            organization_id=organization_id
        ).order_by("created_at").first()

        if not token:
            return Response(
                {"message": "No tokens in queue"},
                status=status.HTTP_404_NOT_FOUND
            )

        token.status = "serving"
        if counter_id:
            token.counter_id = counter_id
        token.served_at = timezone.now()
        token.save()

        return Response({
            "message": "Token called",
            "token": token.token_number,
            "counter": counter_id
        }, status=status.HTTP_200_OK)

class CompleteToken(APIView):
    def post(self, request):
        token_number = request.data.get("token")
        try:
            token = Token.objects.get(token_number=token_number)
        except Token.DoesNotExist:
            return Response({"error": "Token not found"}, status=status.HTTP_404_NOT_FOUND)

        token.status = "completed"
        token.completed_at = timezone.now()
        token.save()
        return Response({"message": "Service completed"}, status=status.HTTP_200_OK)

class CounterList(APIView):
    def get(self, request):
        org_id = request.GET.get("organization")
        if not org_id:
            return Response({"error": "organization id required"}, status=status.HTTP_400_BAD_REQUEST)

        counters = Counter.objects.filter(organization_id=org_id, status="active")
        serializer = CounterSerializer(counters, many=True)
        return Response(serializer.data)

# ── Admin API ──────────────────────────────────────────────

class AdminLogin(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_staff:
            return Response(
                {"error": "Access denied. Staff only."},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            {
                "message": "Login successful",
                "username": user.username,
                "is_staff": user.is_staff,
            },
            status=status.HTTP_200_OK
        )

class AdminTokenList(APIView):
    def get(self, request):
        org_id = request.GET.get("organization")
        tokens = Token.objects.select_related(
            "customer", "service", "organization"
        ).order_by("organization", "created_at")

        if org_id:
            tokens = tokens.filter(organization_id=org_id)

        serializer = AdminTokenSerializer(tokens, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)