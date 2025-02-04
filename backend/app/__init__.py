from flask import Flask
from flask_cors import CORS
from .extensions import db
from .services.s3 import S3Service
import time
import os

def init_minio(app):
    """Инициализация MinIO с повторными попытками"""
    retries = 10
    for i in range(retries):
        try:
            with app.app_context():  # Добавляем контекст приложения здесь
                s3_service = S3Service()
                # Проверяем подключение
                s3_service.s3.head_bucket(Bucket=s3_service.bucket)
                app.logger.info("MinIO connection successful")
                return
        except Exception as e:
            if i < retries - 1:
                app.logger.warning(f"MinIO connection attempt {i+1} failed, retrying in 3s...")
                time.sleep(3)
            else:
                app.logger.error(f"Failed to connect to MinIO after {retries} attempts: {str(e)}")
                raise

def create_app():
    app = Flask(__name__)
    CORS(app)  # Включаем CORS для всех маршрутов
    
    # Загружаем конфигурацию из переменных окружения
    app.config.update(
        SECRET_KEY=os.getenv('SECRET_KEY', 'dev'),
        SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        AWS_ACCESS_KEY_ID=os.getenv('AWS_ACCESS_KEY_ID'),
        AWS_SECRET_ACCESS_KEY=os.getenv('AWS_SECRET_ACCESS_KEY'),
        AWS_DEFAULT_REGION=os.getenv('AWS_DEFAULT_REGION'),
        AWS_ENDPOINT_URL=os.getenv('AWS_ENDPOINT_URL'),
        S3_BUCKET_NAME=os.getenv('S3_BUCKET_NAME')
    )

    # Проверяем обязательные переменные окружения
    required_vars = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_ENDPOINT_URL',
        'S3_BUCKET_NAME'
    ]
    
    missing_vars = [var for var in required_vars if not app.config.get(var)]
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

    # Инициализируем расширения
    db.init_app(app)

    # Создаем таблицы БД и инициализируем MinIO внутри контекста приложения
    with app.app_context():
        db.create_all()
        app.logger.info("Database tables created successfully")
        init_minio(app)

        # Регистрируем маршруты
        from .routes.api import api
        app.register_blueprint(api, url_prefix='/api')

    return app

# Создаем и настраиваем приложение при импорте
application = create_app()