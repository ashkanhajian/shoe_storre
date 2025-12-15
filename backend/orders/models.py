from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class Order(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending", "Pending Payment"),
        ("paid", "Paid"),
        ("canceled", "Canceled"),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft")

    total_amount = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order#{self.id} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)

    variant_id = models.IntegerField()
    sku = models.CharField(max_length=64)
    title = models.CharField(max_length=200)
    size = models.CharField(max_length=8)
    color = models.CharField(max_length=40)

    unit_price = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()

    line_total = models.PositiveIntegerField()

    def __str__(self):
        return f"Item({self.sku}) x{self.quantity}"
