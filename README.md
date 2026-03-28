# Min Bandwidth Routing API

FastAPI-сервис для оптимизации маршрутизации с минимальной пропускной способностью. Использует **Pyomo** и **Gurobi** для решения задач оптимизации, **SQLAlchemy** (PostgreSQL) для хранения данных.

## Быстрый запуск (Docker)

Самый простой способ запустить проект вместе с базой данных:

```bash
docker-compose up --build
```

После запуска:
- **API доступно по адресу:** [http://localhost:8000](http://localhost:8000)
- **Документация (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **База данных PostgreSQL:** `localhost:5433`

## Локальная разработка

Проект использует [uv](https://github.com/astral-sh/uv) для управления зависимостями.

1. **Создайте виртуальное окружение и установите зависимости:**
   ```bash
   uv sync
   ```

2. **Запустите PostgreSQL** (или используйте docker-compose для запуска только БД):
   ```bash
   docker-compose up -d db
   ```

3. **Настройте переменные окружения** (DATABASE_URL):
   ```bash
   # Windows (PowerShell)
   $env:DATABASE_URL = "postgresql+asyncpg://user:pass@localhost:5433/network"
   ```

4. **Запустите сервис:**
   ```bash
   uv run uvicorn main:app --reload
   ```

## Структура проекта

- `api/routes/` — эндпоинты API (topology, demands, optimization).
- `models/` — SQLAlchemy модели базы данных.
- `schemas/` — Pydantic схемы (DTO).
- `db/` — инициализация и сессии базы данных.
- `main.py` — точка входа FastAPI.

## Основные эндпоинты

- `GET /topology/` — управление топологией сети.
- `GET /demands/` — управление требованиями (демандами).
- `POST /optimization/` — запуск процесса оптимизации.