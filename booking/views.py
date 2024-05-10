# bookingbite/booking/views.py

import json
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction

from .models import Dish, DateSaved, DateHasDish
from .serializers import DishSerializer, DateHasDishSerializer
from datetime import datetime
from django.db.models import Q

from django.db.models import F  # Import F expression
from django.utils import timezone




# def get_week_of_year(date_str):
#     date_obj = datetime.strptime(date_str, '%Y-%m-%d')
#     return date_obj.isocalendar()[1]

#  USED BY BOOKING VISITS
 
# def get_week_dishes(request, week=None):
#     # Initialize current_date to None
#     current_date = None

#     # If 'week' is provided, use it; otherwise, use the current week
#     if week is None:
#         current_date = timezone.now().date()
#         start_date = current_date - timezone.timedelta(days=current_date.weekday())
#     else:
#         current_date = timezone.now().date()
#         start_date = current_date - timezone.timedelta(days=current_date.weekday()) + timezone.timedelta(weeks=week - current_date.isocalendar()[1])

#     end_date = start_date + timezone.timedelta(days=4)  # Assuming Monday to Friday


    
#     # Print the current date and week, and calculated start and end dates for debugging
#     print(f"\n\nCurrent Date: {current_date}, Week: {week}")
#     print(f"{start_date} | {end_date}")

#     # Retrieve dishes for the specified week
#     date_has_dishes = DateHasDish.objects.filter(
#         Q(date__gte=start_date) & Q(date__lte=end_date)
#     )

#     # Print the number of DateHasDish instances retrieved for debugging
#     print(f"Number of DateHasDish instances: {len(date_has_dishes)}\n\n")

#     dishes_info = []
#     for date_has_dish in date_has_dishes:
#         if date_has_dish.date:
#             dish_serializer_data = DishSerializer(date_has_dish.dish_id).data
#             date_saved_string = date_has_dish.date.date_saved.strftime("%Y-%m-%d")
            
#             dishes_info.append({
#                 'dish': dish_serializer_data,
#                 'date': date_saved_string
#             })

#     return JsonResponse({'dishes': dishes_info})


from django.core.exceptions import ObjectDoesNotExist

def get_week_dishes(request, week=None):
    # Initialize current_date to None
    current_date = None

    # If 'week' is provided, use it; otherwise, use the current week
    if week is None:
        current_date = timezone.now().date()
        start_date = current_date - timezone.timedelta(days=current_date.weekday())
    else:
        current_date = timezone.now().date()
        start_date = current_date - timezone.timedelta(days=current_date.weekday()) + timezone.timedelta(weeks=week - current_date.isocalendar()[1])

    end_date = start_date + timezone.timedelta(days=4)  # Assuming Monday to Friday

    # Print debugging information
    print("\n\nDebugging Info:")
    print(f"Current Date: {current_date}, Week: {week}")
    print(f"Start Date: {start_date}, End Date: {end_date}")

    # Retrieve dishes for the specified week
    date_has_dishes = DateHasDish.objects.filter(
        Q(date_saved__gte=start_date) & Q(date_saved__lte=end_date)
    )


    # Print the number of DateHasDish instances retrieved for debugging
    print(f"Number of DateHasDish instances: {len(date_has_dishes)}\n\n")

    dishes_info = []
    for date_has_dish in date_has_dishes:
        try:
            # Access the related DishDate object through the 'date_saved' attribute
            date_saved = date_has_dish.date_saved
            dish_serializer_data = DishSerializer(date_has_dish.dish_id).data
            date_saved_string = date_saved.date_saved.strftime("%Y-%m-%d")

            dishes_info.append({
                'dish': dish_serializer_data,
                'date': date_saved_string
            })
        except ObjectDoesNotExist:
            print(f"No DishDate found for DateHasDish ID: {date_has_dish.dish_id}")

    return JsonResponse({'dishes': dishes_info})








def get_dish(request, dish_id):
    """
    Get details of a dish, including associated dates.

    Args:
        request (HttpRequest): The incoming request.
        dish_id (int): The ID of the dish to retrieve.

    Returns:
        JsonResponse: JSON response with dish details and associated dates.
    """
    try:
        dish = Dish.objects.get(pk=dish_id)
        dish_serializer = DishSerializer(dish)
        
        # Get all related DateHasDish instances, sorted by date in descending order
        date_has_dishes = DateHasDish.objects.filter(dish_id=dish).order_by('-date')

        # Extract the string representation of dates and create a list
        date_list = [str(date_has_dish.date) for date_has_dish in date_has_dishes]

        response_data = {
            'dish': dish_serializer.data,
            'dates': date_list,
            # more data?
        }
        
        return JsonResponse(response_data, status=200)
    
    except Dish.DoesNotExist:
        return JsonResponse({'error': 'Dish not found'}, status=404)



@csrf_exempt
def update_dish(request, dish_id):
    """
    Update a dish if it has no associated DateHasDish entries.

    Args:
        request (HttpRequest): The incoming request.
        dish_id (int): The ID of the dish to update.

    Returns:
        JsonResponse: JSON response with success or error message.
    """
    dish = get_object_or_404(Dish, pk=dish_id)
    data = json.loads(request.body)

    # Check if the dish has associated DateHasDish entries
    if DateHasDish.objects.filter(dish_id=dish_id).exists():
        return JsonResponse({'error': 'Cannot update dish with associated DateHasDish entries'}, status=400)

    # Update Dish
    dish_serializer = DishSerializer(instance=dish, data=data.get('dish', {}), partial=True)
    if dish_serializer.is_valid():
        dish_serializer.save()
        return JsonResponse({'message': 'Entry updated successfully'}, status=200)
    else:
        return JsonResponse({'error': dish_serializer.errors}, status=400)



@csrf_exempt
def delete_dishes(request):
    """
    Delete one or more dishes if they have no associated DateHasDish entries.

    Args:
        request (HttpRequest): The incoming request.

    Returns:
        JsonResponse: JSON response with success or error message.
    """
    try:
        data = json.loads(request.body)
        dish_ids = data.get('dish_ids', [])

        # Ensure valid dish IDs are provided
        if not dish_ids:
            return HttpResponseBadRequest('Invalid dish IDs format. Please provide a list of dish IDs.')

        # Use a database transaction to ensure atomicity
        with transaction.atomic():
            for dish_id in dish_ids:
                try:
                    dish = Dish.objects.get(pk=dish_id)
                except Dish.DoesNotExist:
                    continue  # Skip to the next dish ID if the dish doesn't exist

                # Filter DateHasDish entries with the given dish_id
                date_has_dishes = DateHasDish.objects.filter(dish_id=dish_id)

                # Check if there are any associated DateHasDish entries
                if date_has_dishes.exists():
                    return JsonResponse({'error': f'DateHasDish entries exist for Dish ID {dish_id}, cannot delete Dish'}, status=400)

                # No DateHasDish entries found, proceed with deletion
                dish.delete()

            return JsonResponse({'message': 'Dishes deleted successfully'}, status=204)

    except json.JSONDecodeError:
        return HttpResponseBadRequest('Invalid JSON format. Please provide a valid JSON payload.')

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)





@csrf_exempt
def delete_future_dates(request):
    """
    Delete future dates and associated entries (if any).

    Args:
        request (HttpRequest): The incoming request.

    Returns:
        JsonResponse: JSON response with success or error message.
    """
    try:
        data = json.loads(request.body)
        dates_to_delete = data.get('dates', [])

        # Ensure valid dates are provided
        if not dates_to_delete:
            return HttpResponseBadRequest('Invalid dates format. Please provide a list of dates in YYYY-MM-DD format.')

        # Use a database transaction to ensure atomicity
        with transaction.atomic():
            for date_to_delete in dates_to_delete:
                date_instance = get_date_instance(date_to_delete)
                if date_instance:
                    # Get all DateHasDish entries associated with the provided date
                    date_has_dishes = DateHasDish.objects.filter(date=date_instance)

                    # Delete all associated DateHasDish entries
                    date_has_dishes.delete()

                    # Delete the Date instance
                    date_instance.delete()
                else:
                    return JsonResponse({'error': f'Date not found for {date_to_delete}'}, status=404)

            return JsonResponse({'message': 'Dates and associated entries deleted successfully'}, status=204)

    except json.JSONDecodeError:
        return HttpResponseBadRequest('Invalid JSON format. Please provide a valid JSON payload.')

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_date_instance(date_str):
    """
    Get a Date instance based on a date string.

    Args:
        date_str (str): The date string in YYYY-MM-DD format.

    Returns:
        Date: The Date instance or None if not found.
    """
    try:
        return Date.objects.get(date=date_str)
    except Date.DoesNotExist:
        return None




def delete_date(request, date_id):
    """
    Delete a specific date and associated entries.

    Args:
        request (HttpRequest): The incoming request.
        date_id (int): The ID of the date to delete.

    Returns:
        JsonResponse: JSON response with success or error message.
    """
    date_instance = get_object_or_404(Date, pk=date_id)

    # Use a database transaction to ensure atomicity
    with transaction.atomic():
        # Get all DateHasDish entries associated with the given date
        date_has_dishes = DateHasDish.objects.filter(date=date_instance)

        # Delete all associated DateHasDish entries
        date_has_dishes.delete()

        # Delete the Date instance
        date_instance.delete()

    return JsonResponse({'message': 'Date deleted successfully'}, status=204)



@csrf_exempt
def add_attendance(request):
    if request.method == 'POST':
        try:
            data = request.body.decode('utf-8')  # Decode the request body
            dates = json.loads(data)  # Directly parse the decoded data as a list of dates
            print("DATA:", dates)  # Print the list directly
            for date_str in dates:
                # Print or log date string for debugging
                print("Date String:", date_str)
                # Try to get the DishDate instance for the given date
                date_saved, created = DateSaved.objects.get_or_create(date_saved=date_str)
                # Print or log DishDate instance and creation status for debugging
                print("DishDate:", date_saved, "Created:", created)
                
                if date_saved is not None:  # Check if DishDate object is retrieved successfully
                    # Increment attendance count by 1
                    date_saved.attendance = F('attendance') + 1
                    date_saved.save()
                    print("SAVED +1")
                else:
                    raise ValueError(f"DishDate not found for date: {date_str}")
            return JsonResponse({'message': 'Attendance added successfully'}, status=200)
        except Exception as e:
            # Print or log any exceptions for debugging
            print("Error:", e)
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return HttpResponseNotAllowed(['POST'])

@csrf_exempt
def remove_attendance(request):
    if request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            dates = data  # Directly assign the parsed list to dates

            for date_str in dates:
                date_saved = DateSaved.objects.get(date_saved=date_str)
                if date_saved is not None:
                    if date_saved.attendance is not None and date_saved.attendance > 0:
                        # Decrement attendance count by 1
                        date_saved.attendance = F('attendance') - 1
                        date_saved.save()
                        print("SAVED -1")
                    else:
                        raise ValueError(f"Attendance count is already 0 for date: {date_str}")
                else:
                    raise ValueError(f"DishDate not found for date: {date_str}")

            return JsonResponse({'message': 'Attendance removed successfully'}, status=200)
        except Exception as e:
            print("Error:", e)
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return HttpResponseNotAllowed(['DELETE'])
