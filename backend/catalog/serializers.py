from rest_framework import serializers
from .models import Product, ProductImage, Variant

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["image_url", "alt_text", "sort_order"]

class VariantSerializer(serializers.ModelSerializer):
    quantity = serializers.IntegerField(source="inventory.quantity", read_only=True)

    class Meta:
        model = Variant
        fields = ["id", "sku", "size", "color", "price", "is_active", "quantity"]

class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.title")
    brand = serializers.CharField(source="brand.title")
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "title", "slug", "category", "brand", "thumbnail"]

    def get_thumbnail(self, obj):
        first = obj.images.first()
        return first.image_url if first else None

class ProductDetailSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.title")
    brand = serializers.CharField(source="brand.title")
    images = ProductImageSerializer(many=True, read_only=True)
    variants = VariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ["id", "title", "slug", "description", "category", "brand", "images", "variants"]
