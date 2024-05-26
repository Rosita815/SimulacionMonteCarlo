from django.urls import path
from .views import calculate_probability, delete_row, generate_distributions

urlpatterns = [
    path('calculate_probability/', calculate_probability, name='calculate_probability'),
    path('delete_row/', delete_row, name='delete_row'),
    path('generate_distributions/', generate_distributions, name='generate_distributions'),
]
