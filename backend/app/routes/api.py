from flask import Blueprint, request, jsonify, current_app
from ..models import db, User, Device, File
from ..services.s3 import S3Service
from datetime import datetime
import json
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.models import Message, Subscriber

api = Blueprint('api', __name__)
s3_service = S3Service()

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@api.route('/visit', methods=['POST'])
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

@api.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        device_id = request.form.get('device_id')
        
        if not device_id:
            return jsonify({'error': 'Device ID required'}), 400

        device = Device.query.get(device_id)
        if not device:
            return jsonify({'error': 'Device not found'}), 404

        s3_key = s3_service.upload_file(file, file.content_type)
        
        file_record = File(
            device_id=device_id,
            s3_key=s3_key,
            original_name=file.filename,
            mime_type=file.content_type,
            size=file.content_length if file.content_length else 0
        )
        
        db.session.add(file_record)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'file_id': file_record.id,
            's3_key': s3_key
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error uploading file: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@api.route('/files/<int:file_id>', methods=['GET'])
def get_file(file_id):
    try:
        file_record = File.query.get(file_id)
        if not file_record:
            return jsonify({'error': 'File not found'}), 404

        url = s3_service.get_presigned_url(file_record.s3_key)
        
        return jsonify({
            'url': url,
            'filename': file_record.original_name,
            'mime_type': file_record.mime_type,
            'size': file_record.size
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting file: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@api.route('/debug/data', methods=['GET'])
def get_debug_data():
    try:
        users = User.query.all()
        files = File.query.all()
        
        return jsonify({
            'users': [{
                'id': u.id, 
                'ip_address': u.ip_address,
                'created_at': str(u.created_at) if u.created_at else None,
                'first_visit': str(u.first_visit) if u.first_visit else None,
                'last_visit': str(u.last_visit) if u.last_visit else None,
                'devices': [{
                    'id': d.id,
                    'device_info': json.loads(d.device_info) if d.device_info else {},
                    'user_agent': d.user_agent,
                    'created_at': str(d.created_at) if d.created_at else None,
                    'last_visit': str(d.last_visit) if d.last_visit else None,
                    'summary': {
                        'platform': json.loads(d.device_info).get('hardware', {}).get('platform') if d.device_info else None,
                        'browser': d.user_agent.split(' ')[-1] if d.user_agent else None,
                        'screen': json.loads(d.device_info).get('screen', {}).get('resolution') if d.device_info else None,
                        'cpu_cores': json.loads(d.device_info).get('hardware', {}).get('cpuCores') if d.device_info else None,
                        'memory': f"{json.loads(d.device_info).get('hardware', {}).get('memory')}GB" if d.device_info and json.loads(d.device_info).get('hardware', {}).get('memory') else None,
                        'connection': json.loads(d.device_info).get('network', {}).get('speed') if d.device_info else None,
                    }
                } for d in u.devices]  # используем связь из модели User
            } for u in users],
            'files': [{
                'id': f.id,
                'device_id': f.device_id,
                'original_name': f.original_name,
                'mime_type': f.mime_type,
                'size': f.size,
                'created_at': str(f.created_at) if f.created_at else None
            } for f in files]
        })
    except Exception as e:
        current_app.logger.error(f"Error in debug data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/debug/generate', methods=['POST'])
def generate_test_data():
    try:
        # Создаем тестового пользователя
        user = User(
            ip_address='127.0.0.1',
            created_at=datetime.utcnow(),
            first_visit=datetime.utcnow(),
            last_visit=datetime.utcnow()
        )
        db.session.add(user)
        db.session.flush()

        # Создаем тестовое устройство с новой структурой
        test_device_info = {
            'screen': {
                'resolution': '1920x1080',
                'available': '1920x1040',
                'colorDepth': 24,
                'pixelRatio': 1
            },
            'window': {
                'size': '1600x900',
                'outerSize': '1920x1040'
            },
            'hardware': {
                'platform': 'Test Platform',
                'cpuCores': 4,
                'memory': 8,
                'touchPoints': 0
            },
            'network': {
                'speed': '4g',
                'saveData': False,
                'online': True
            },
            'locale': {
                'language': 'en-US',
                'timezone': 'UTC',
                'timezoneOffset': 0
            },
            'features': {
                'webgl': True,
                'canvas2d': True,
                'webrtc': True,
                'websocket': True,
                'webworker': True,
                'battery': True,
                'bluetooth': False,
                'geolocation': True
            },
            'codecs': {
                'audio': {'mp3': True, 'ogg': True},
                'video': {'h264': True, 'webm': True}
            },
            'visitTime': datetime.utcnow().isoformat()
        }

        device = Device(
            user_id=user.id,
            device_info=json.dumps(test_device_info),
            user_agent='Test User Agent',
            created_at=datetime.utcnow(),
            last_visit=datetime.utcnow()
        )
        db.session.add(device)
        db.session.flush()
        
        # Создаем тестовый файл
        file = File(
            device_id=device.id,
            original_name='test.txt',
            mime_type='text/plain',
            size=100,
            s3_key='test/test.txt',
            created_at=datetime.utcnow()
        )
        db.session.add(file)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Test data generated successfully',
            'user_id': user.id,
            'device_id': device.id,
            'file_id': file.id
        })
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error generating test data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/health', methods=['GET'])
def health_check():
    try:
        # Проверяем подключение к БД
        db.session.execute('SELECT 1')
        
        # Проверяем подключение к MinIO
        s3_service.s3.head_bucket(Bucket=s3_service.bucket)
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'storage': 'connected'
        }), 200
    except Exception as e:
        current_app.logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@api.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@api.route('/api/contact', methods=['POST'])
def contact():
    data = request.json
    try:
        message = Message(
            name=data['name'],
            email=data['email'],
            message=data['message']
        )
        db.session.add(message)
        db.session.commit()
        return jsonify({'message': 'Message sent successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.json
    try:
        subscriber = Subscriber(email=data['email'])
        db.session.add(subscriber)
        db.session.commit()
        return jsonify({'message': 'Subscribed successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400 