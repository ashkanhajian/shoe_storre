from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "sku",
            "title",
            "size",
            "color",
            "unit_price",
            "quantity",
            "line_total",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "total_amount",
            "created_at",
            "items",
        ]
