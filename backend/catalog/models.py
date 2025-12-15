from django.db import models

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimeStampedModel):
    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)

    def __str__(self):
        return self.title


class Brand(TimeStampedModel):
    title = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)

    def __str__(self):
        return self.title


class Product(TimeStampedModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class ProductImage(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField(max_length=500)  # فعلاً URL؛ بعداً فایل هم می‌کنیم
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"Image({self.product_id})"


class Variant(TimeStampedModel):
    SIZE_CHOICES = [
        ("36", "36"), ("37", "37"), ("38", "38"), ("39", "39"),
        ("40", "40"), ("41", "41"), ("42", "42"), ("43", "43"), ("44", "44"),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    sku = models.CharField(max_length=64, unique=True)
    size = models.CharField(max_length=8, choices=SIZE_CHOICES)
    color = models.CharField(max_length=40)
    price = models.PositiveIntegerField()  # تومان/ریال را بعداً استاندارد می‌کنیم
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [("product", "size", "color")]

    def __str__(self):
        return f"{self.product.title} - {self.size} - {self.color}"


class Inventory(TimeStampedModel):
    variant = models.OneToOneField(Variant, on_delete=models.CASCADE, related_name="inventory")
    quantity = models.IntegerField(default=0)

    def __str__(self):
        return f"Inv({self.variant.sku})={self.quantity}"
