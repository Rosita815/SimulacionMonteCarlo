import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import random
import io
import base64
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import DemandSerializer

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
def calculate_cumulative_probability(request):
    global demand_data

    if not demand_data:
        return Response({'error': 'No demand data available'}, status=status.HTTP_400_BAD_REQUEST)

    # Calcular la probabilidad acumulada
    cumulative_probability = 0
    for item in demand_data:
        cumulative_probability += item['probability']
        item['cumulative_probability'] = cumulative_probability

    return Response({'demand_data': demand_data}, status=status.HTTP_200_OK)

@api_view(['GET'])
def generate_plot(request):
    global demand_data

    if not demand_data:
        return Response({'error': 'No demand data available'}, status=status.HTTP_400_BAD_REQUEST)

    # Crear el gráfico
    x = [item['demand'] for item in demand_data]
    y = [item['cumulative_probability'] for item in demand_data]
    probabilities = [item['probability'] for item in demand_data]

    plt.figure(figsize=(14, 8))
    bars = plt.bar(x, y, color=sns.color_palette("cividis", len(x)), edgecolor='black', alpha=0.7)
    plt.xlabel('Demanda diaria de llantas radiales')
    plt.ylabel('Probabilidad acumulada')
    plt.title('Gráfico de Probabilidad Acumulada')

    # Añadir etiquetas de probabilidad
    for bar, prob in zip(bars, probabilities):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height(), f'{prob:.2f}',
                 ha='center', va='bottom', color='black')

    # Añadir marcadores de números aleatorios al lado derecho
    for index, bar in enumerate(bars):
        if index == 0:
            lower_bound = 1
        else:
            lower_bound = int(demand_data[index - 1]['cumulative_probability'] * 100) + 1
        upper_bound = int(demand_data[index]['cumulative_probability'] * 100)
        midpoint = (lower_bound + upper_bound) / 2

        # Añadir etiqueta del intervalo
        plt.text(1.02, bar.get_height(), f'{lower_bound:02d}-{upper_bound:02d}', 
                 ha='left', va='center', color='black', transform=plt.gca().transAxes)
        
        # Añadir líneas de marcador desde el punto medio superior de cada barra hacia la derecha
        plt.plot([bar.get_x() + bar.get_width() / 2, len(x)], [bar.get_height(), bar.get_height()],
                 color='#D2691E', linestyle='--')

    # Ajustar límites del gráfico para asegurar que las líneas lleguen hasta el final
    plt.xlim(-0.5, max(x) + 0.5)
    plt.ylim(0, 1)

    # Convertir gráfico a imagen PNG
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    image_png = buf.getvalue()
    buf.close()

    # Codificar imagen en base64
    image_base64 = base64.b64encode(image_png).decode('utf-8')
    return Response({'image': image_base64}, status=status.HTTP_200_OK)

@api_view(['GET'])
def simulate_demand(request):
    global demand_data

    if not demand_data:
        return Response({'error': 'No demand data available'}, status=status.HTTP_400_BAD_REQUEST)

    # Generar números aleatorios
    random_numbers = [random.randint(1, 100) for _ in range(10)]
    simulated_demand = []

    # Calcular demanda diaria simulada
    for num in random_numbers:
        for item in demand_data:
            lower_bound = 1 if demand_data.index(item) == 0 else int(demand_data[demand_data.index(item) - 1]['cumulative_probability'] * 100) + 1
            upper_bound = int(item['cumulative_probability'] * 100)
            if lower_bound <= num <= upper_bound:
                simulated_demand.append({'day': len(simulated_demand) + 1, 'random_number': num, 'demand': item['demand']})
                break

    total_demand = sum(item['demand'] for item in simulated_demand)
    average_demand = total_demand / 10

    return Response({
        'random_numbers': random_numbers,
        'simulated_demand': simulated_demand,
        'total_demand': total_demand,
        'average_demand': average_demand
    }, status=status.HTTP_200_OK)