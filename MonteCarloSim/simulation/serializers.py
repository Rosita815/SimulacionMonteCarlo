# serializers.py
from rest_framework import serializers

class DemandSerializer(serializers.Serializer):
    demand = serializers.IntegerField()
    frequency = serializers.IntegerField()
