#bookingbite/menu_management/urls.py

from django.urls import path
from . import views

urlpatterns = [
      
    path('create/', views.create_dish, name='create_dish'),
    path('day-dishes/', views.get_day_dishes, name='day_dishes'),
    path('day-dishes/<str:date_str>/', views.get_day_dishes, name='day_dishes_specific'),
    path('delete-dish-from-date/', views.delete_dish_from_date, name='delete_dish_from_date'),

]

