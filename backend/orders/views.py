from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import ListAPIView

from catalog.models import Variant, Inventory
from .models import Order, OrderItem
from .serializers import OrderSerializer  # برای /orders/my/


class OrderCreateAPIView(APIView):
    """
    POST /api/orders/
    Body:
    {
      "items": [
        {"variantId": 12, "qty": 2},
        {"variantId": 30, "qty": 1}
      ]
    }

    نکته: قیمت از دیتابیس خوانده می‌شود و موجودی به صورت اتمیک کم می‌شود.
    """
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        items = request.data.get("items", [])

        if not isinstance(items, list) or len(items) == 0:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user.is_authenticated else None
        order = Order.objects.create(user=user, status="pending")

        total = 0

        for i in items:
            variant_id = i.get("variantId")
            qty = i.get("qty")

            if not isinstance(variant_id, int) or not isinstance(qty, int) or qty < 1:
                return Response(
                    {"detail": "Invalid items format. Each item needs variantId(int) and qty(int>=1)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Variant باید فعال باشد
            try:
                variant = (
                    Variant.objects
                    .select_related("product")
                    .get(id=variant_id, is_active=True, product__is_active=True)
                )
            except Variant.DoesNotExist:
                transaction.set_rollback(True)
                return Response(
                    {"detail": f"Variant {variant_id} not found/active."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Inventory را برای جلوگیری از race-condition قفل می‌کنیم
            try:
                inv = Inventory.objects.select_for_update().get(variant_id=variant.id)
            except Inventory.DoesNotExist:
                transaction.set_rollback(True)
                return Response(
                    {"detail": f"Inventory for variant {variant_id} not found."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if inv.quantity < qty:
                transaction.set_rollback(True)
                return Response(
                    {
                        "detail": "Not enough stock.",
                        "sku": variant.sku,
                        "available": inv.quantity,
                        "requested": qty,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # کم کردن موجودی
            inv.quantity -= qty
            inv.save(update_fields=["quantity"])

            unit_price = variant.price
            line_total = unit_price * qty
            total += line_total

            # Snapshot داخل OrderItem
            OrderItem.objects.create(
                order=order,
                variant_id=variant.id,
                sku=variant.sku,
                title=variant.product.title,
                size=variant.size,
                color=variant.color,
                unit_price=unit_price,
                quantity=qty,
                line_total=line_total,
            )

        order.total_amount = total
        order.save(update_fields=["total_amount"])

        return Response(
            {"order_id": order.id, "total": order.total_amount},
            status=status.HTTP_201_CREATED,
        )




class MyOrdersAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related("items")
            .order_by("-id")
        )