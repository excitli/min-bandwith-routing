FROM python:3.14-slim-bookworm

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libglpk-dev \
    glpk-utils \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev

COPY . .

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]