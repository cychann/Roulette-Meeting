from django.shortcuts import render

def index(request):
    return render(request, 'meeting/index.html', {})

def room(request, room_name):
    return render(request, 'meeting/room.html', {
        'room_name': room_name
    })