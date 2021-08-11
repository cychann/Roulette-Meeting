import os
import logging
import socketio
from django.shortcuts import render

redis = os.getenv("REDIS_URL", "redis://")
mgr = None  # socketio.RedisManager(redis)
sio = socketio.Server(async_mode='eventlet', client_manager=mgr)


def index(request):
    return render(request, 'meeting/index.html')


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
