#!/bin/sh

if [ "$APP_ENV" = "development" ]; then
    exec python -m uvicorn main:api --host 0.0.0.0 --port 8000 --reload --log-level debug
else
    exec python -m uvicorn main:api --host 0.0.0.0 --port 8000 --workers 4 --log-level error
fi