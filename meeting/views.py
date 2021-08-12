
from django.http.response import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
import os
import logging
import socketio
from django.shortcuts import render, get_object_or_404

from .models import Meeting
from .forms import MeetingForm


redis = os.getenv("REDIS_URL", "redis://")
mgr = socketio.RedisManager(redis)
sio = socketio.Server(async_mode='eventlet', client_manager=mgr)


def index(request):
    try:
        meeting = get_object_or_404(Meeting, id=request.GET.get("room"))
        return render(request, 'meeting/index.html', {"meeting": meeting})
    except:
        return HttpResponse(status=404)


@login_required
def create_meeting(request):
    if request.method == "POST":
        form = MeetingForm(data=request.POST)
        if form.is_valid():
            meeting = form.save()
            return JsonResponse({
                "id": meeting.id,
                "name": meeting.name,
            }, status=201)
    return JsonResponse({
        "error": "잘못된 접근입니다.",
    }, status=400)


gunicorn_logger = logging.getLogger("gunicorn.error")
logger = sio.logger
logger.handlers = gunicorn_logger.handlers
logger.setLevel(gunicorn_logger.level)

NS = "/stream"


@sio.on('subscribe', namespace=NS)
def subscribe(sid, data):
    logger.debug(f"sio, {sid}, {data}")

    sio.enter_room(sid, data["room"], namespace=NS)
    sio.enter_room(sid, data["socketId"], namespace=NS)

    if len(sio.rooms(sid, namespace=NS)) > 1:
        sio.emit(
            'new user',
            namespace=NS,
            room=data["room"],
            skip_sid=sid,
            data={
                "socketId": data["socketId"],
                "username": data["username"],
            },
        )


@sio.on('newUserStart', namespace=NS)
def newUserStart(sid, data):
    logger.debug(f"newUserStart, {sid}, {data}")
    sio.emit(
        'newUserStart',
        namespace=NS,
        to=data["to"],
        skip_sid=sid,
        data={
            "sender": data["sender"],
            "username": data["username"]
        },
    )


@sio.on('sdp', namespace=NS)
def sdp(sid, data):
    logger.debug(f"sdp, {sid}, {data}")
    sio.emit(
        'sdp',
        namespace=NS,
        to=data["to"],
        data={
            "description": data["description"],
            "sender": data["sender"],
            "username": data["username"]
        },
    )


@sio.on('ice candidates', namespace=NS)
def ice_candidates(sid, data):
    logger.debug(f"ice_candidates, {sid}, {data}")
    sio.emit(
        'ice candidates',
        namespace=NS,
        to=data["to"],
        data={
            "candidate": data["candidate"],
            "sender": data["sender"],
            "username": data["username"]
        },
    )


@sio.on('chat', namespace=NS)
def chat(sid, data):
    logger.debug(f"chat, {sid}, {data}")
    sio.emit(
        'chat',
        namespace=NS,
        room=data["room"],
        skip_sid=sid,
        data={
            "sender": data["sender"],
            "msg": data["msg"]
        },
    )


@sio.on('random', namespace=NS)
def random(sid, data):
    logger.debug(f"random, {sid}, {data}")
    sio.emit(
        'random',
        namespace=NS,
        room=data["room"],
        data={
            "sender": data["sender"],
            "choice": data["choice"],
        },
    )
