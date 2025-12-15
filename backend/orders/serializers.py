from django.db import transaction
from rest_framework import serializers

from catalog.models import Variant, Inventory
from .models import Order, OrderItem


class OrderItemCreateSerializer(serializers.Serializer):
    variantId = serializers.IntegerField()
    qty = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Cart is empty.")
        return items

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        user = request.user if request.user.is_authenticated else None

        # Order ابتدا ساخته می‌شود
        order = Order.objects.create(user=user, status="pending")

        total = 0
        # برای جلوگیری از race condition: قفل روی inventory
        for i in validated_data["items"]:
            variant_id = i["variantId"]
            qty = i["qty"]

            # Variant باید فعال باشد
            try:
                variant = (
                    Variant.objects
                    .select_related("product")
                    .get(id=variant_id, is_active=True, product__is_active=True)
                )
            except Variant.DoesNotExist:
                raise serializers.ValidationError({"variantId": f"Variant {variant_id} not found/active."})

            # Inventory را قفل می‌کنیم
            try:
                inv = Inventory.objects.select_for_update().get(variant_id=variant.id)
            except Inventory.DoesNotExist:
                raise serializers.ValidationError({"variantId": f"Inventory for variant {variant_id} not found."})

            if inv.quantity < qty:
                raise serializers.ValidationError({"variantId": f"Not enough stock for {variant.sku}. Available: {inv.quantity}"})

            # کم کردن موجودی
            inv.quantity -= qty
            inv.save(update_fields=["quantity"])

            unit_price = variant.price
            line_total = unit_price * qty
            total += line_total

            # Snapshot در OrderItem
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

        return order
