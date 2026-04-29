#!/bin/bash

echo "waiting for postgres startup"

sleep 4

echo "Migrations startup: "
uv run alembic upgrade head
echo "Server startup: "
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload