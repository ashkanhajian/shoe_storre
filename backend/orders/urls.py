from django.urls import path
from .views import OrderCreateAPIView, MyOrdersAPIView

urlpatterns = [
    path("orders/", OrderCreateAPIView.as_view()),
    path("orders/my/", MyOrdersAPIView.as_view()),
]