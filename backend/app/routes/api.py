from flask import Blueprint, request, jsonify, current_app
from ..models import db, User, Device, File, Message, Subscriber
from ..services.s3 import S3Service
from datetime import datetime
import json
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import uuid

bp = Blueprint('api', __name__, url_prefix='/api')

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@bp.route('/')
def index():
    return jsonify({
        'status': 'ok',
        'message': 'API is running'
    })

@bp.route('/visit', methods=['POST'])
@limiter.limit("1 per second")
def record_visit():
    try:
        ip = request.headers.get('X-Forwarded-For', request.headers.get('X-Real-IP', request.remote_addr))
        if ',' in ip:
            ip = ip.split(',')[0].strip()
            
        raw_device_info = request.json.get('device_info', {})
        user_agent = request.headers.get('User-Agent', '')
        
        # Создаем оптимизированную структуру данных без дублирования
        device_info = {
            'screen': {
                'resolution': raw_device_info.get('screenResolution'),
                'available': raw_device_info.get('screenAvailable'),
                'colorDepth': raw_device_info.get('screenColorDepth'),
                'pixelRatio': raw_device_info.get('screenPixelRatio')
            },
            'window': {
                'size': raw_device_info.get('windowSize'),
                'outerSize': raw_device_info.get('windowOuterSize')
            },
            'hardware': {
                'platform': raw_device_info.get('platform'),
                'cpuCores': raw_device_info.get('cpuCores'),
                'memory': raw_device_info.get('deviceMemory'),
                'touchPoints': raw_device_info.get('maxTouchPoints')
            },
            'network': {
                'speed': raw_device_info.get('connectionSpeed'),
                'saveData': raw_device_info.get('connectionSaveData'),
                'online': raw_device_info.get('onLine')
            },
            'locale': {
                'language': raw_device_info.get('language'),
                'timezone': raw_device_info.get('timezone'),
                'timezoneOffset': raw_device_info.get('timezoneOffset')
            },
            'features': {
                'webgl': raw_device_info.get('webgl'),
                'canvas2d': raw_device_info.get('canvas2d'),
                'webrtc': raw_device_info.get('webRTCSupport'),
                'websocket': raw_device_info.get('webSocketSupport'),
                'webworker': raw_device_info.get('webWorkerSupport'),
                'battery': raw_device_info.get('batterySupport'),
                'bluetooth': raw_device_info.get('bluetoothSupport'),
                'geolocation': raw_device_info.get('geoLocationSupport')
            },
            'codecs': {
                'audio': raw_device_info.get('audioCodecs'),
                'video': raw_device_info.get('videoCodecs')
            },
            'visitTime': raw_device_info.get('visitTime')
        }

        current_app.logger.info(f"Recording visit from IP: {ip}")
        current_app.logger.info(f"Raw device info: {json.dumps(device_info, indent=2)}")

        # Сначала ищем существующего пользователя по IP
        user = User.query.filter_by(ip_address=ip).first()
        if not user:
            user = User(
                ip_address=ip,
                first_visit=datetime.utcnow(),
                created_at=datetime.utcnow()
            )
            db.session.add(user)
            db.session.flush()
            current_app.logger.info(f"Created new user: {user.id}")
        else:
            user.last_visit = datetime.utcnow()
            current_app.logger.info(f"Found existing user: {user.id}")

        # Создаем хеш устройства для сравнения
        device_hash = json.dumps({
            'platform': device_info.get('hardware', {}).get('platform'),
            'screen': device_info.get('screen', {}).get('resolution'),
            'cpu_cores': device_info.get('hardware', {}).get('cpuCores'),
            'memory': device_info.get('hardware', {}).get('memory'),
            'user_agent': user_agent
        }, sort_keys=True)

        # Ищем существующее устройство по хешу
        existing_device = None
        for device in Device.query.filter_by(user_id=user.id).all():
            try:
                stored_info = json.loads(device.device_info)
                stored_hash = json.dumps({
                    'platform': stored_info['hardware']['platform'],
                    'screen': stored_info['screen']['resolution'],
                    'cpu_cores': stored_info['hardware']['cpuCores'],
                    'memory': stored_info['hardware']['memory'],
                    'user_agent': device.user_agent
                }, sort_keys=True)
                
                if stored_hash == device_hash:
                    existing_device = device
                    break
            except:
                continue

        if existing_device:
            # Обновляем существующее устройство
            existing_device.last_visit = datetime.utcnow()
            device_id = existing_device.id
            current_app.logger.info(f"Updated existing device: {device_id}")
        else:
            # Создаем новое устройство
            new_device = Device(
                user_id=user.id,
                device_info=json.dumps(device_info),
                user_agent=user_agent,
                last_visit=datetime.utcnow()
            )
            db.session.add(new_device)
            db.session.flush()
            device_id = new_device.id
            current_app.logger.info(f"Created new device: {device_id}")

        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'user_id': user.id,
            'device_id': device_id
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error recording visit: {str(e)}")
        current_app.logger.error(f"Request data: {request.get_data()}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'No file selected'}), 400

    try:
        s3_service = S3Service()
        s3_key = s3_service.upload_file(file, file.content_type)
        
        db_file = File(
            file_id=str(uuid.uuid4()),
            filename=file.filename,
            s3_key=s3_key,
            content_type=file.content_type,
            size=file.content_length or 0
        )
        db.session.add(db_file)
        db.session.commit()
        
        return jsonify({
            'status': 'ok',
            'fileId': db_file.file_id,
            'filename': db_file.filename,
            'url': s3_service.get_presigned_url(s3_key)
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Error uploading file: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to upload file'}), 500

@bp.route('/files')
def list_files():
    try:
        s3_service = S3Service()
        files = s3_service.list_files()
        return jsonify({
            'status': 'ok',
            'files': files
        })
    except Exception as e:
        current_app.logger.error(f"Error listing files: {str(e)}")
        return jsonify({'error': 'Failed to list files'}), 500

@bp.route('/files/<file_id>')
def get_file(file_id):
    file = File.query.filter_by(file_id=file_id).first()
    if not file:
        return jsonify({'error': 'File not found'}), 404
        
    try:
        s3_service = S3Service()
        url = s3_service.get_presigned_url(file.s3_key)
        return jsonify({
            'status': 'ok',
            'fileId': file.file_id,
            'filename': file.filename,
            'url': url
        })
    except Exception as e:
        current_app.logger.error(f"Error getting file: {str(e)}")
        return jsonify({'error': 'Failed to get file'}), 500

@bp.route('/debug/data', methods=['GET'])
def get_debug_data():
    try:
        users = User.query.all()
        devices = Device.query.all()
        messages = Message.query.all()
        subscribers = Subscriber.query.all()
        files = File.query.all()
        
        return jsonify({
            'status': 'ok',
            'data': {
                'users': [{'id': u.id, 'email': u.email} for u in users],
                'devices': [{'id': d.id, 'deviceId': d.device_id, 'visits': d.visit_count} for d in devices],
                'messages': [{'id': m.id, 'email': m.email} for m in messages],
                'subscribers': [{'id': s.id, 'email': s.email} for s in subscribers],
                'files': [{'id': f.file_id, 'filename': f.filename} for f in files]
            }
        })
    except Exception as e:
        current_app.logger.error(f"Error getting debug data: {str(e)}")
        return jsonify({'error': 'Failed to get debug data'}), 500

@bp.route('/debug/generate', methods=['POST'])
def generate_test_data():
    try:
        # Создаем тестового пользователя
        user = User(
            email='test@example.com',
            password_hash='test123'
        )
        db.session.add(user)
        
        # Создаем тестовое устройство
        device = Device(
            device_id=str(uuid.uuid4()),
            user_agent='Test Browser',
            ip_address='127.0.0.1',
            visit_count=1
        )
        db.session.add(device)
        
        # Создаем тестовое сообщение
        message = Message(
            name='Test User',
            email='test@example.com',
            message='This is a test message'
        )
        db.session.add(message)
        
        # Создаем тестового подписчика
        subscriber = Subscriber(
            email='subscriber@example.com'
        )
        db.session.add(subscriber)
        
        db.session.commit()
        
        return jsonify({
            'status': 'ok',
            'message': 'Test data generated successfully'
        })
    except Exception as e:
        current_app.logger.error(f"Error generating test data: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to generate test data'}), 500

@bp.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat()
    })

@bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@bp.route('/contact', methods=['POST'])
def submit_contact():
    data = request.get_json()
    
    required_fields = ['name', 'email', 'message']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
        
    try:
        message = Message(
            name=data['name'],
            email=data['email'],
            message=data['message']
        )
        db.session.add(message)
        db.session.commit()
        
        return jsonify({
            'status': 'ok',
            'messageId': message.id
        })
    except Exception as e:
        current_app.logger.error(f"Error submitting contact: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to submit contact form'}), 500

@bp.route('/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'error': 'Missing email'}), 400
        
    try:
        subscriber = Subscriber(email=data['email'])
        db.session.add(subscriber)
        db.session.commit()
        
        return jsonify({
            'status': 'ok',
            'subscriberId': subscriber.id
        })
    except Exception as e:
        current_app.logger.error(f"Error subscribing: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to subscribe'}), 500 