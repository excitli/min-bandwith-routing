# Min Bandwidth Routing API

FastAPI-сервис для оптимизации маршрутизации с минимальной пропускной способностью. Использует **Pyomo** и **GLPK** для решения задач оптимизации, **SQLAlchemy** (PostgreSQL) для хранения данных.

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
   Откройте `.env` и заполните данные для подключения: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` и другие (например, для локальной БД в Docker укажите `POSTGRES_HOST=localhost` и `POSTGRES_PORT=5433`).

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
   uv run uvicorn app.main:app --reload
   ```

## Структура проекта

```
├── app/                    # Основной пакет приложения
│   ├── main.py             # Точка входа FastAPI
│   ├── core/               # Конфигурация и общие зависимости
│   │   ├── config.py       # Настройки (Pydantic Settings)
│   │   └── dependencies.py # FastAPI-зависимости (сессия БД и др.)
│   ├── api/                # Слой API
│   │   └── routes/         # Эндпоинты
│   │       ├── router.py   # Главный роутер
│   │       ├── topology.py # Управление топологией
│   │       ├── demands.py  # Управление демандами
│   │       └── optimization.py
│   ├── models/             # SQLAlchemy-модели
│   │   ├── base.py         # Базовый класс DeclarativeBase
│   │   ├── scenario.py
│   │   ├── node.py
│   │   ├── edge.py
│   │   └── demand.py
│   ├── schemas/            # Pydantic-схемы (DTO)
│   │   ├── topology.py
│   │   └── demands.py
│   └── db/                 # Инициализация и сессии БД
│       └── session.py
├── migrations/             # Alembic-миграции
│   ├── env.py
│   └── versions/
├── alembic.ini
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Основные эндпоинты

- `POST /topology/` — создание топологии сети (сценарий + рёбра).
- `POST /demands/` — добавление требований (демандов) к сценарию.
- `POST /optimization/` — запуск процесса оптимизации.
