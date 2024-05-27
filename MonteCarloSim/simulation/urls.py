from django.urls import path
from .views import calculate_probability, delete_row, calculate_cumulative_probability, generate_plot

urlpatterns = [
    path('calculate_probability/', calculate_probability, name='calculate_probability'),
    path('delete_row/', delete_row, name='delete_row'),
    path('calculate_cumulative_probability/', calculate_cumulative_probability, name='calculate_cumulative_probability'),
    path('generate_plot/', generate_plot, name='generate_plot'),
]
