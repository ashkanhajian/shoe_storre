from django.contrib import admin
from .models import PaymentTransaction

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "amount", "gateway", "status", "authority", "ref_id", "created_at")
    list_filter = ("gateway", "status")
    search_fields = ("authority", "ref_id", "order__id")
