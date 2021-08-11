"""gunicorn 설정 파일"""
from multiprocessing import cpu_count
from os import environ

# Project
wsgi_app = "RouletteMeeting.wsgi:application"

# Debugging
reload = False if environ.get("DEBUG", "False").lower() == "false" else True

# URL
bind = environ.get("HOST", "0.0.0.0") + ":" + environ.get("PORT", "7000")

# Worker
worker_class = 'eventlet'
workers = cpu_count()
threads = workers * 4

# HTTP
max_requests = 1000

# Log
loglevel = environ.get("LOGLEVEL", 'warn')
accesslog = environ.get("ACCESSLOG", "-")
errorlog = environ.get("ERRORLOG", "-")
