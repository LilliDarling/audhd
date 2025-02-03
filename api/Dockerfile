FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        gcc \
        python3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

RUN poetry config virtualenvs.create false

WORKDIR /api

COPY pyproject.toml poetry.lock* ./

RUN poetry install --no-interaction --no-root

COPY . .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["poetry", "run", "uvicorn", "main:api", "--reload", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]