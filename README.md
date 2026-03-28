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

2. **Настройте локальное окружение:**
   Скопируйте пример файла конфигурации `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```
   Откройте `.env` и заполните данные для подключения: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` и другие (например, для локальной БД в Docker укажите `POSTGRES_HOST=localhost` и `POSTGRES_PORT=5433`). А также убедитесь, что корректно формируется переменная `DATABASE_URL` (либо задайте её вручную по образцу `postgresql+asyncpg://user:pass@localhost:5433/db_name`).

3. **Запустите PostgreSQL** (например, через подготовленный docker-compose файл):
   ```bash
   docker-compose up -d db
   ```

4. **Создайте первичную структуру БД (инициализация таблиц):**
   До запуска бэкенда необходимо применить миграции через Alembic, чтобы в базе данных появились нужные таблицы:
   ```bash
   uv run alembic upgrade head
   ```

5. **Запустите сервис:**
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