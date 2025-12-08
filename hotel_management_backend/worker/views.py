from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Worker, Task
from .serializers import WorkerSerializer, TaskSerializer


# WORKER CRUD

class WorkerListCreateView(generics.ListCreateAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer


class WorkerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer



# TASK CRUD

class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer



# CALENDAR ENDPOINT
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

