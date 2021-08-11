#!/bin/bash

NAME="Socket_app" # Name of the application
DJANGODIR=.
SOCKFILE=socket
USER=$USER                                      # the user to run as
NUM_WORKERS=1                                   # how many worker processes should Gunicorn spawn
DJANGO_SETTINGS_MODULE=RouletteMeeting.settings # which settings file should Djangouse
DJANGO_WSGI_MODULE=RouletteMeeting.wsgi         # WSGI module name

# Uvicorn이나 Lifespan on을 넣은 Custom을 사용
GUNICORN_WORKER=eventlet

echo "Starting $NAME as $(whoami)"

# Activate the virtual environment
source ./myvenv/bin/activate
export DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE
export PYTHONPATH=$DJANGODIR:$PYTHONPATH

# Create the run directory if it doesn't exist
RUNDIR=$(dirname $SOCKFILE)
test -d $RUNDIR || mkdir -p $RUNDIR

exec gunicorn ${DJANGO_WSGI_MODULE}:application -k ${GUNICORN_WORKER} \
    --name $NAME \
    --workers $NUM_WORKERS \
    --user=$USER \
    --bind=0.0.0.0:8000 \
    --threads=1000 \
    --log-level=debug \
    --log-file=- \
    --reload
