from flask import Flask, jsonify
from flask_cors import CORS
from .extensions import db
from .services.s3 import S3Service
from .models import User, Device, File, Message, Subscriber  # Добавляем импорт моделей
import time
import os
from datetime import datetime

def init_minio(app):
    """Инициализация MinIO с повторными попытками"""
    retries = 10
    for i in range(retries):
        try:
            with app.app_context():
                s3_service = S3Service()
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

def init_db(app):
    """Инициализация базы данных"""
    with app.app_context():
        try:
            # Создаем все таблицы
            db.create_all()
            app.logger.info("Database tables created successfully")
            
            # Проверяем, есть ли данные в таблицах
            if not User.query.first():
                app.logger.info("Initializing database with test data...")
                # Создаем тестового пользователя
                test_user = User(
                    ip_address='127.0.0.1',
                    created_at=datetime.utcnow(),
                    first_visit=datetime.utcnow(),
                    last_visit=datetime.utcnow()
                )
                db.session.add(test_user)
                db.session.commit()
                app.logger.info("Test data created successfully")
        except Exception as e:
            app.logger.error(f"Error initializing database: {str(e)}")
            raise

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/')
    def index():
        return jsonify({
            "status": "ok",
            "message": "Backend server is running"
        })
    
    # Загружаем конфигурацию из переменных окружения
    app.config.update(
        SECRET_KEY=os.getenv('SECRET_KEY', 'dev'),
        SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        AWS_ACCESS_KEY_ID=os.getenv('AWS_ACCESS_KEY_ID'),
        AWS_SECRET_ACCESS_KEY=os.getenv('AWS_SECRET_ACCESS_KEY'),
        AWS_REGION=os.getenv('AWS_REGION'),
        AWS_ENDPOINT_URL=os.getenv('AWS_ENDPOINT_URL'),
        S3_BUCKET_NAME=os.getenv('S3_BUCKET_NAME')
    )

    # Проверяем обязательные переменные окружения
    required_vars = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_ENDPOINT_URL',
        'S3_BUCKET_NAME',
        'AWS_REGION'
    ]
    
    missing_vars = [var for var in required_vars if not app.config.get(var)]
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

    # Инициализируем расширения
    db.init_app(app)

    # Инициализируем базу данных и MinIO
    init_db(app)
    init_minio(app)

    # Регистрируем маршруты
    from .routes.api import bp as api_bp
    from .routes.debug import bp as debug_bp
    app.register_blueprint(api_bp)
    app.register_blueprint(debug_bp)

    return app

# Создаем и настраиваем приложение при импорте
application = create_app()