## Hotel management backend

Create virtual environment 
```python
cd hotel_management_backend
python -m venv .venv
```
Activate .venv
```python
.venv\Scripts\Activate.ps1 # windows
source .venv/bin/activate # mac/linux
```
run migrations
```python
python manage.py makemigrations
python manage.py migrate
```
run backend 
```python
python manage.py runserver
```
start fronend
```python
npm run dev
```
access fronend
```python
http://localhost:5173/
```
access bakcend
```python
http://localhost:8000/api/
```