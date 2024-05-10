# BookingBite/chef_management/models.py

from django.db import models
from common.models import Dish, DateSaved, DateHasDish


    
# class OrderHasDish(models.Model):
#     order_id = models.IntegerField()
#     dish_id = models.IntegerField()
    
# class Order(models.Model):
#     order_id = models.IntegerField(primary_key=True)
#     date = models.ForeignKey(Date, on_delete=models.CASCADE)
#     order_type = models.TextField()


# class EmployeeHasOrder(models.Model):
#     employee_number = models.IntegerField()
#     order_id = models.IntegerField()

# class Employee(models.Model):
#     employee_number = models.IntegerField(primary_key=True)
#     first_name = models.CharField(max_length=10)
#     last_name = models.CharField(max_length=10)
#     user_id = models.CharField(max_length=10)
#     location = models.CharField(max_length=10)
#     area = models.CharField(max_length=10)
#     sap_hr_num = models.CharField(max_length=10)
#     cost_center = models.CharField(max_length=10)


# class UserCredential(models.Model):
#     credential_id = models.AutoField(primary_key=True)
#     employee_number = models.IntegerField()
#     role = models.TextField()
#     password = models.TextField()


# class Feedback(model.Model):