from django.contrib import admin
from .models import Category, Brand, Product, ProductImage, Variant, Inventory

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slug")
    search_fields = ("title", "slug")

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slug")
    search_fields = ("title", "slug")

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class VariantInline(admin.TabularInline):
    model = Variant
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slug", "category", "brand", "is_active", "created_at")
    list_filter = ("is_active", "category", "brand")
    search_fields = ("title", "slug")
    inlines = [ProductImageInline, VariantInline]

@admin.register(Variant)
class VariantAdmin(admin.ModelAdmin):
    list_display = ("id", "sku", "product", "size", "color", "price", "is_active")
    list_filter = ("is_active", "size", "color")
    search_fields = ("sku", "product__title")

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("id", "variant", "quantity")
