import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
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

        demand_data.append({'demand': demand, 'frequency': frequency})

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

    x = [item['demand'] for item in demand_data]
    y = [item['cumulative_probability'] for item in demand_data]
    probabilities = [item['probability'] for item in demand_data]

    plt.figure(figsize=(14, 8))
    bars = plt.bar(x, y, color=sns.color_palette("cividis", len(x)), edgecolor='black', alpha=0.7)
    plt.xlabel('Demanda diaria de llantas radiales')
    plt.ylabel('Probabilidad acumulada')
    plt.title('Gráfico de Probabilidad Acumulada')

    for bar, prob in zip(bars, probabilities):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height(), f'{prob:.2f}',
                 ha='center', va='bottom', color='black')

    for index, bar in enumerate(bars):
        if index == 0:
            lower_bound = 1
        else:
            lower_bound = int(demand_data[index - 1]['cumulative_probability'] * 100) + 1
        upper_bound = int(demand_data[index]['cumulative_probability'] * 100)
        midpoint = (lower_bound + upper_bound) / 2

        plt.text(1.02, bar.get_height(), f'{lower_bound:02d}-{upper_bound:02d}', 
                 ha='left', va='center', color='black', transform=plt.gca().transAxes)

        plt.plot([bar.get_x() + bar.get_width() / 2, len(x)], [bar.get_height(), bar.get_height()],
                 color='#D2691E', linestyle='--')

    plt.xlim(-0.5, max(x) + 0.5)
    plt.ylim(0, 1)

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    image_png = buf.getvalue()
    buf.close()

    image_base64 = base64.b64encode(image_png).decode('utf-8')
    return Response({'image': image_base64}, status=status.HTTP_200_OK)

@api_view(['POST'])
def reset_simulation(request):
    global demand_data
    demand_data = []
    return Response({'message': 'Simulation reset successful'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def simulate_demand(request):
    global demand_data

    if not demand_data:
        return Response({'error': 'No demand data available'}, status=status.HTTP_400_BAD_REQUEST)

    total_days = int(request.GET.get('days', 10))
    random_numbers = np.random.randint(1, 101, total_days)
    simulated_demand = []
    total_demand = 0

    for day, random_number in enumerate(random_numbers, 1):
        for item in demand_data:
            lower_bound = int(item['cumulative_probability'] * 100) - int(item['probability'] * 100) + 1
            upper_bound = int(item['cumulative_probability'] * 100)
            if lower_bound <= random_number <= upper_bound:
                simulated_demand.append({
                    'day': day,
                    'random_number': random_number,
                    'demand': item['demand']
                })
                total_demand += item['demand']
                break

    average_demand = total_demand / total_days

    return Response({
        'simulated_demand': simulated_demand,
        'total_demand': total_demand,
        'average_demand': average_demand
    }, status=status.HTTP_200_OK)