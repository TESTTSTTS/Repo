from .extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    first_visit = db.Column(db.DateTime)
    last_visit = db.Column(db.DateTime)
    
    devices = db.relationship('Device', backref='user', lazy=True)
    files = db.relationship('File', backref='user', lazy=True)

class Device(db.Model):
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    device_info = db.Column(db.Text)  # JSON с информацией об устройстве
    user_agent = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_visit = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    files = db.relationship('File', backref='device', lazy=True)

    def __repr__(self):
        return f'<Device {self.id}>'

class File(db.Model):
    __tablename__ = 'files'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    file_path = db.Column(db.String(255))  # Путь к файлу на диске
    original_name = db.Column(db.String(255))
    mime_type = db.Column(db.String(255))
    size = db.Column(db.Integer)
    checksum = db.Column(db.String(64))  # MD5 хеш файла
    is_public = db.Column(db.Boolean, default=False)
    download_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_url(self):
        return f"/api/files/{self.id}/download"

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.original_name,
            'size': self.size,
            'mime_type': self.mime_type,
            'is_public': self.is_public,
            'download_count': self.download_count,
            'created_at': self.created_at.isoformat(),
            'url': self.get_url()
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Subscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)