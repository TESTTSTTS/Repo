from flask import Flask, jsonify
from flask_cors import CORS
from .extensions import db
from .models import User, Device, File, Message, Subscriber
import os
from datetime import datetime

def init_db(app):
    """Инициализация базы данных"""
    with app.app_context():
        try:
            # Удаляем все таблицы
            db.drop_all()
            app.logger.info("Database tables dropped successfully")
            
            # Создаем все таблицы заново
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
        SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL', 'sqlite:///app.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # Максимальный размер файла 16MB
        UPLOAD_FOLDER=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'storage', 'uploads')
    )

    # Создаем директорию для загрузки файлов, если она не существует
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Инициализируем расширения
    db.init_app(app)

    # Инициализируем базу данных
    init_db(app)

    # Регистрируем маршруты
    from .routes.api import bp as api_bp
    from .routes.debug import bp as debug_bp
    app.register_blueprint(api_bp)
    app.register_blueprint(debug_bp)

    return app

# Создаем и настраиваем приложение при импорте
application = create_app()