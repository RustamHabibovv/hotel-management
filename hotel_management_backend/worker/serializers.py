from rest_framework import serializers
from .models import Worker, Task
from user.models import User

class WorkerSerializer(serializers.ModelSerializer):
    """
    Serializer pour Worker qui inclut les infos du User associé
    """
    email = serializers.EmailField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)

    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    
    class Meta:
        model = Worker
        fields = [
            'id',
            'user',
            'name',
            'surname',
            'email',           
            'role',            
            'contracts',
            'jobs',
            'contact_info',
            'hotel',
            'hotel_name',             ]
        read_only_fields = ['email', 'role', 'hotel_name']


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer pour Task
    """
    worker_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id',
            'name',
            'upload_date',
            'completion_date',
            'start_datetime',
            'end_datetime',
            'reserved',
            'worker',
            'worker_name',    
        ]
        read_only_fields = ['upload_date', 'worker_name']
    
    def get_worker_name(self, obj):
        """
        Retourne le nom complet du worker si assigné
        """
        if obj.worker:
            return f"{obj.worker.name} {obj.worker.surname}"
        return None