from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import OrderCreateSerializer

class OrderCreateAPIView(APIView):
    def post(self, request):
        serializer = OrderCreateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            {"order_id": order.id, "total": order.total_amount},
            status=status.HTTP_201_CREATED,
        )
