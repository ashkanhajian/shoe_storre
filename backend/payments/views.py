import uuid
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from orders.models import Order
from .models import PaymentTransaction
from .serializers import InitiatePaymentSerializer


class InitiatePaymentAPIView(APIView):
    """
    ایجاد تراکنش و برگرداندن payment_url برای درگاه mock
    """
    def post(self, request):
        s = InitiatePaymentSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        order = get_object_or_404(Order, id=s.validated_data["order_id"])

        if order.status != "pending":
            return Response({"detail": "Order is not pending."}, status=status.HTTP_400_BAD_REQUEST)

        tx = PaymentTransaction.objects.create(
            order=order,
            amount=order.total_amount,
            gateway="mock",
            status="initiated",
            authority=str(uuid.uuid4()),
        )

        # درگاه mock: یک URL برمی‌گردانیم که فرانت به آن navigate کند
        payment_url = f"/pay/mock?authority={tx.authority}"

        return Response(
            {"transaction_id": tx.id, "authority": tx.authority, "payment_url": payment_url},
            status=status.HTTP_201_CREATED,
        )


class MockReturnAPIView(APIView):
    """
    شبیه‌سازی callback/verify:
    GET /api/payments/mock-return/?authority=...&status=ok|fail
    """
    @transaction.atomic
    def get(self, request):
        authority = request.query_params.get("authority", "")
        st = request.query_params.get("status", "ok")

        tx = get_object_or_404(PaymentTransaction, authority=authority, gateway="mock")

        # اگر قبلاً پرداخت شده، idempotent
        if tx.status == "paid":
            return Response({"ok": True, "order_id": tx.order_id, "ref_id": tx.ref_id})

        if st != "ok":
            tx.status = "failed"
            tx.save(update_fields=["status"])
            return Response({"ok": False, "detail": "Payment failed", "order_id": tx.order_id}, status=400)

        # موفق
        tx.status = "paid"
        tx.ref_id = str(uuid.uuid4())[:12]
        tx.save(update_fields=["status", "ref_id"])

        order = tx.order
        order.status = "paid"
        order.save(update_fields=["status"])

        return Response({"ok": True, "order_id": order.id, "ref_id": tx.ref_id})
