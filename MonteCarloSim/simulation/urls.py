from django.urls import path
from .views import calculate_probability, delete_row, calculate_cumulative_probability, generate_plot, simulate_demand, reset_simulation

urlpatterns = [
    path('calculate_probability/', calculate_probability, name='calculate_probability'),
    path('delete_row/', delete_row, name='delete_row'),
    path('calculate_cumulative_probability/', calculate_cumulative_probability, name='calculate_cumulative_probability'),
    path('generate_plot/', generate_plot, name='generate_plot'),
    path('simulate_demand/', simulate_demand, name='simulate_demand'),
    path('reset_simulation/', reset_simulation, name='reset_simulation'),
]
