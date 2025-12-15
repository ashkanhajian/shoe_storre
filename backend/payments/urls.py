from django.urls import path
from .views import InitiatePaymentAPIView, MockReturnAPIView

urlpatterns = [
    path("payments/initiate/", InitiatePaymentAPIView.as_view()),
    path("payments/mock-return/", MockReturnAPIView.as_view()),
]
