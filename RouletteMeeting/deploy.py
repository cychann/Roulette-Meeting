from .settings import *

import dj_database_url

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', SECRET_KEY)

db_default = os.environ.get("DEFAULT_POSTGRESS")
db_from_env = dj_database_url.config(conn_max_age=500, default=db_default)
DATABASES['default'].update(db_from_env)

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get('REDIS_URL'),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MIDDLEWARE += [
    # Simplified static file serving.
    # https://warehouse.python.org/project/whitenoise/
    'whitenoise.middleware.WhiteNoiseMiddleware',
]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
