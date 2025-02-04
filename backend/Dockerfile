FROM python:3.9-slim

WORKDIR /app

# Устанавливаем необходимые пакеты
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копируем и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код приложения
COPY . .

# Проверяем наличие всех необходимых файлов
RUN ls -la && \
    test -f app/__init__.py && \
    test -f app/services/s3.py

# Определяем переменные окружения
ENV FLASK_APP=app
ENV FLASK_ENV=development
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Добавляем healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8000/health || exit 1

# Запускаем приложение
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "--preload", "app:application"]
