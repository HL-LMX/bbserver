# Bookingbite/common/models.py

from django.db import models


class Dish(models.Model):
    dish_id = models.AutoField(primary_key=True)
    dish_name = models.TextField()
    dish_description = models.TextField(null=True)
    dish_type = models.TextField()
    dish_calories = models.IntegerField(null=True)
    light_healthy = models.BooleanField(null=True)
    sugar_free = models.BooleanField(null=True)

    class Meta:
        db_table = 'dish'


class DateSaved(models.Model):
    date_saved = models.DateField(primary_key=True)
    attendance = models.IntegerField(null=True)

    class Meta:
        db_table = 'date_saved'
        
        
class DateHasDish(models.Model):
    date_has_dish_id = models.AutoField(primary_key=True)
    date_saved = models.ForeignKey(DateSaved, on_delete=models.CASCADE, db_column='date')
    dish_id = models.ForeignKey('Dish', on_delete=models.CASCADE, db_column='dish_id')
    quantity = models.IntegerField(null=True)
    
    rating_sum = models.PositiveIntegerField(default=0)
    rating_count = models.PositiveIntegerField(default=0)
    
    
    @property
    def average_rating(self):
        """
        Returns the average star rating (float), or None if there are no ratings.
        """
        if self.rating_count == 0:
            return None
        return self.rating_sum / self.rating_count
    
    class Meta:
        db_table = 'date_has_dish'