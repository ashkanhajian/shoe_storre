from django.db import models
from orders.models import Order

class PaymentTransaction(models.Model):
    STATUS_CHOICES = [
        ("initiated", "Initiated"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
    amount = models.PositiveIntegerField()
    gateway = models.CharField(max_length=32, default="mock")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="initiated")

    # شناسه‌های درگاه (برای mock هم نگه می‌داریم)
    authority = models.CharField(max_length=128, blank=True, default="")
    ref_id = models.CharField(max_length=128, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pay#{self.id} order={self.order_id} {self.status}"
