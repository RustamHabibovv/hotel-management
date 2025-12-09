from django.shortcuts import render, redirect
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone
from .models import Worker, Task
from .serializers import WorkerSerializer, TaskSerializer
from django.conf import settings
import urllib.parse
import requests
from django.contrib.auth.decorators import login_required
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.http import JsonResponse, HttpResponse
from rest_framework_simplejwt.tokens import AccessToken
from user.models import User as CustomUser

# ========== GOOGLE CALENDAR UTILITY FUNCTIONS ==========

def refresh_google_token(worker):
    if not worker.google_refresh_token:
        return None
    
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        'client_id': settings.GOOGLE_CLIENT_ID,
        'client_secret': settings.GOOGLE_CLIENT_SECRET,
        'refresh_token': worker.google_refresh_token,
        'grant_type': 'refresh_token',
    }
    
    try:
        response = requests.post(token_url, data=data)
        tokens = response.json()
        
        if 'access_token' in tokens:
            worker.google_access_token = tokens['access_token']
            worker.save()
            return tokens['access_token']
    except Exception as e:
        print(f"Error refreshing token: {e}")
    
    return None


def create_calendar_event(worker, task):
    if not worker.google_access_token:
        return None
    
    try:
        credentials = Credentials(token=worker.google_access_token)
        service = build('calendar', 'v3', credentials=credentials)
        
        event = {
            'summary': f'Task: {task.name}',
            'description': f'Hotel task assigned to {worker.name} {worker.surname}',
        }
        
        if task.start_datetime and task.end_datetime:
            event['start'] = {
                'dateTime': task.start_datetime.isoformat(),
                'timeZone': 'UTC',
            }
            event['end'] = {
                'dateTime': task.end_datetime.isoformat(),
                'timeZone': 'UTC',
            }
        
        created_event = service.events().insert(calendarId='primary', body=event).execute()
        
        return created_event.get('id')
        
    except HttpError as error:
        if error.resp.status == 401:
            new_token = refresh_google_token(worker)
            if new_token:
                return create_calendar_event(worker, task)
        print(f"Calendar API error: {error}")
    except Exception as e:
        print(f"Error creating calendar event: {e}")
    
    return None


def delete_calendar_event(worker, event_id):
    if not worker.google_access_token or not event_id:
        return False
    
    try:
        credentials = Credentials(token=worker.google_access_token)
        service = build('calendar', 'v3', credentials=credentials)
        
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        return True
        
    except HttpError as error:
        if error.resp.status == 401:  # Token expiré
            new_token = refresh_google_token(worker)
            if new_token:
                return delete_calendar_event(worker, event_id)
        print(f"Calendar API error: {error}")
    except Exception as e:
        print(f"Error deleting calendar event: {e}")
    
    return False


# ========== WORKER CRUD ==========

class WorkerListCreateView(generics.ListCreateAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer


class WorkerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer


# ========== TASK CRUD ==========

class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        old_worker_id = instance.worker_id
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        instance.refresh_from_db()
        
        if instance.worker_id and old_worker_id != instance.worker_id:
            try:
                worker = Worker.objects.get(id=instance.worker_id)
                
                if worker.google_access_token:
                    event_id = create_calendar_event(worker, instance)
                    if event_id:
                        instance.google_calendar_event_id = event_id
                        instance.save()
                        print(f"Event created in Google Calendar: {event_id}")
                    else:
                        print("Could not create calendar event (token may be invalid)")
                else:
                    print("ℹWorker has no Google Calendar connected")
                    
            except Worker.DoesNotExist:
                pass
        
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.worker and instance.google_calendar_event_id:
            try:
                worker = Worker.objects.get(id=instance.worker_id)
                if delete_calendar_event(worker, instance.google_calendar_event_id):
                    print(f"Event deleted from Google Calendar: {instance.google_calendar_event_id}")
                else:
                    print("Could not delete calendar event")
            except Worker.DoesNotExist:
                pass
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ========== CALENDAR ENDPOINT ==========
# /tasks/calendar?date=2025-12-08

class TaskCalendarView(APIView):
    def get(self, request):
        date_str = request.GET.get("date")
        if not date_str:
            return Response({"error": "date parameter required"}, status=400)

        try:
            target_date = timezone.datetime.fromisoformat(date_str).date()
        except:
            return Response({"error": "invalid date format"}, status=400)

        tasks = Task.objects.filter(
            start_datetime__date__lte=target_date,
            end_datetime__date__gte=target_date
        )

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)


# ========== GOOGLE OAUTH ==========

def google_login(request):
    # Get token from query parameter
    token = request.GET.get('token')
    
    if not token:
        return JsonResponse({"error": "Token required. Use ?token=YOUR_JWT_TOKEN"}, status=401)
    
    try:        
        # Validate and decode token
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        
        
        
        # Find worker using custom User ID
        workers = Worker.objects.filter(user_id=user_id)
        
        worker = workers.first()
        if not worker:
            return JsonResponse({"error": "No worker found for this user"}, status=400)
        
        worker_id = worker.id
        request.session['pending_google_auth_worker_id'] = worker_id
        
    except Exception as e:
        import traceback
        # traceback.print_exc()
        return JsonResponse({"error": "An error occured"}, status=400)
    
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/calendar",
        "access_type": "offline",
        "prompt": "consent",
        "state": str(worker_id)
    }

    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    return redirect(url)

def google_callback(request):
    code = request.GET.get("code")
    state = request.GET.get("state")
    
    
    if not code:
        print("No code received")
        return redirect("http://localhost:5173/planning?error=no_code")
    
    # Get worker_id
    worker_id = state or request.session.get('pending_google_auth_worker_id')
    
    if not worker_id:
        print("No worker_id")
        return redirect("http://localhost:5173/planning?error=no_worker_id")

    data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI
    }

    print(f"Sending token request to Google...")
    r = requests.post("https://oauth2.googleapis.com/token", data=data)
    tokens = r.json()
    
    print(f"Google response: {tokens}")
    
    if 'error' in tokens:
        print(f"Google error: {tokens['error']}")
        return redirect(f"http://localhost:5173/planning?error={tokens['error']}")

    try:
        worker = Worker.objects.get(id=worker_id)
        print(f"Worker found: {worker.name} {worker.surname} (ID: {worker.id})")
        
        worker.google_access_token = tokens["access_token"]
        worker.google_refresh_token = tokens.get("refresh_token")
        worker.save()
        
        print(f"Tokens saved for worker {worker.id}")
        print(f"   - Access token: {tokens['access_token'][:50]}...")
        print(f"   - Refresh token: {tokens.get('refresh_token', 'None')[:50] if tokens.get('refresh_token') else 'None'}...")
        
        if 'pending_google_auth_worker_id' in request.session:
            del request.session['pending_google_auth_worker_id']
        
        return redirect("http://localhost:5173/planning?google_connected=true")
    except Worker.DoesNotExist:
        print(f"Worker {worker_id} not found")
        return redirect("http://localhost:5173/planning?error=worker_not_found")