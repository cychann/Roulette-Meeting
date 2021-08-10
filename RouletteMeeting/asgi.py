import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import meeting.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "RouletteMeeting.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            meeting.routing.websocket_urlpatterns
        )
    ),
})
