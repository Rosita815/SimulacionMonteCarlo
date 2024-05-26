from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import DemandSerializer
import numpy as np

demand_data = []

@api_view(['POST'])
def calculate_probability(request):
    global demand_data

    serializer = DemandSerializer(data=request.data)
    if serializer.is_valid():
        demand = serializer.validated_data['demand']
        frequency = serializer.validated_data['frequency']

        # Añadir la nueva demanda y frecuencia a la lista
        demand_data.append({'demand': demand, 'frequency': frequency})

        # Recalcular probabilidades
        total_days = sum(item['frequency'] for item in demand_data)
        for item in demand_data:
            item['probability'] = item['frequency'] / total_days

        return Response({'demand_data': demand_data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def delete_row(request):
    global demand_data

    index = request.data.get('index')
    if index is not None and 0 <= index < len(demand_data):
        demand_data.pop(index)
        
        # Recalcular probabilidades
        total_days = sum(item['frequency'] for item in demand_data)
        for item in demand_data:
            item['probability'] = item['frequency'] / total_days

        return Response({'demand_data': demand_data}, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid index'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def generate_distributions(request):
    global demand_data

    if not demand_data:
        return Response({'error': 'No demand data available'}, status=status.HTTP_400_BAD_REQUEST)

    # Convertir las frecuencias en probabilidades
    total_days = sum(item['frequency'] for item in demand_data)
    probabilities = [item['frequency'] / total_days for item in demand_data]

    # Generar distribuciones
    mu = np.mean([item['demand'] for item in demand_data])
    sigma = np.std([item['demand'] for item in demand_data])
    normal_dist = np.random.normal(mu, sigma, 1000).tolist()
    
    poisson_dist = np.random.poisson(mu, 1000).tolist()

    return Response({
        'normal_distribution': normal_dist,
        'poisson_distribution': poisson_dist
    }, status=status.HTTP_200_OK)
