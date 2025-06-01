# bookingbite/chef_management/views.py

import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction

from common.models import Dish, DateSaved, DateHasDish
from common.serializers import DishSerializer, DateHasDishSerializer
from django.utils import timezone
from datetime import datetime
from django.views.decorators.http import require_http_methods, require_GET

@require_GET
def search_dishes(request):
    """
    Search existing Dish entries by name (or other fields if desired).
    Query string: ?q=<partial_name>
    Returns a JSON array of matching dishes (dish_id, dish_name, dish_calories, light_healthy, sugar_free, etc.).
    """
    q = request.GET.get('q', '').strip()
    if not q:
        return JsonResponse({'results': []})
    
    # Example: case-insensitive name search (you can extend Q to more fields if needed)
    matches = Dish.objects.filter(dish_name__icontains=q)[:10]
    serializer = DishSerializer(matches, many=True)
    return JsonResponse({'results': serializer.data})

@csrf_exempt
def create_dish(request):
    """
    Create a new dish and optionally assign it to dates.

    Args:
        request (HttpRequest): The incoming request.

    Returns:
        JsonResponse: JSON response with success or error message.
    
    Structure:
        {
        "dish": {
            "dish_name": "DISH_NAME",
            "dish_description": "DISH_DESCRIPTION",
            "dish_type": "DISH_TYPE",
            "dish_calories": INTEGER,
            "light_healthy": BOOLEAN,
            "sugar_free": BOOLEAN
        },
        "dates": ["YYYY-MM-DD", ...]  // List of date strings to assign the dish (optional)
        }
    """
    try:
        data = json.loads(request.body)

        # Case A: Reuse existing dish
        if 'existing_dish_id' in data:
            dish_id = data['existing_dish_id']
            try:
                dish_instance = Dish.objects.get(pk=dish_id)
            except Dish.DoesNotExist:
                return JsonResponse({'error': f'Dish with ID {dish_id} not found.'}, status=404)
        
        # Case B: Create a brand-new dish
        else:
            dish_data = data.get('dish', {})
            dish_serializer = DishSerializer(data=dish_data)
            
            # print('Serializer Errors:', dish_serializer.errors)
            
            if not dish_serializer.is_valid():
                return JsonResponse({'error': dish_serializer.errors}, status=400)
            
            dish_instance = dish_serializer.save()

        # Now, link to dates (if any)
        if 'dates' in data and isinstance(data['dates'], list):
            for date_str in data['dates']:
                date_instance, _ = DateSaved.objects.get_or_create(
                    date_saved=date_str,
                    defaults={'attendance': 0}
                )
                # Avoid duplicate DateHasDish entries for same dish + date
                DateHasDish.objects.get_or_create(
                    date_saved=date_instance,
                    dish_id=dish_instance,
                    defaults={'quantity': None}
                )

        return JsonResponse({'message': 'Dish linked successfully'}, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON payload.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
def get_day_dishes(request, date_str=None):
    """
    Get dishes for a specific day or today if none is given.

    Args:
        request (HttpRequest): The incoming request.
        date_str (str): The date string in YYYY-MM-DD format (optional).

    Returns:
        JsonResponse: JSON response with dishes for the specified day or today,
        including the attendance amount.
    """
    try:
        if date_str:
            try:
                date_instance = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
        else:
            # If no date is provided, use today's date
            date_instance = timezone.now().date()

        # Retrieve dishes for the specified date
        date_has_dishes = DateHasDish.objects.filter(date_saved=date_instance)
        
        # Retrieve attendance amount for the specified date
        attendance_amount = DateSaved.objects.filter(date_saved=date_instance).values_list('attendance', flat=True).first()

        dishes_info = []
        for date_has_dish in date_has_dishes:
            # Serialize the instance to get its data
            date_has_dish_serializer = DateHasDishSerializer(date_has_dish)
            # Get the serialized data, including date_has_dish_id
            serialized_data = date_has_dish_serializer.data
            dishes_info.append(serialized_data)

        return JsonResponse({'dishes': dishes_info, 'attendance': attendance_amount})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



@require_http_methods(["DELETE"])
@csrf_exempt
def delete_dish_from_date(request):
    """
    Delete one or more DateHasDish entries from the database.

    Args:
        request (HttpRequest): The incoming request.

    Returns:
        JsonResponse: JSON response with success or error message.
    """
    try:
        data = json.loads(request.body)
        date_has_dish_ids = data.get('date_has_dish_ids', [])

        # Ensure valid date_has_dish_ids are provided
        if not date_has_dish_ids:
            return HttpResponseBadRequest('Invalid date_has_dish_ids format. Please provide a list of date_has_dish_ids.')

        # Use a database transaction to ensure atomicity
        with transaction.atomic():
            for date_has_dish_id in date_has_dish_ids:
                # Retrieve the DateHasDish instance
                date_has_dish = DateHasDish.objects.filter(date_has_dish_id=date_has_dish_id).first()

                # Check if the DateHasDish instance exists
                if date_has_dish:
                    # Delete the DateHasDish entry
                    date_has_dish.delete()
                else:
                    return JsonResponse({'error': f'DateHasDish entry with ID {date_has_dish_id} not found'}, status=404)

            return JsonResponse({'message': 'DateHasDish entries {date_has_dish_id} deleted successfully'}, status=204)

    except json.JSONDecodeError:
        return HttpResponseBadRequest('Invalid JSON format. Please provide a valid JSON payload.')

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
