from rest_framework import generics
from .models import Product
from .serializers import ProductListSerializer, ProductDetailSerializer

class ProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True).select_related("category", "brand").prefetch_related("images")
    serializer_class = ProductListSerializer

class ProductDetailAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related("category", "brand").prefetch_related("images", "variants", "variants__inventory")
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"
from django.shortcuts import render

# Create your views here.
