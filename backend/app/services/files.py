import os
from werkzeug.utils import secure_filename
from datetime import datetime
import hashlib
import shutil
from ..models import File, db

class FileService:
    def __init__(self, app):
        self.storage_path = os.path.join(app.root_path, 'storage')
        self.uploads_path = os.path.join(self.storage_path, 'uploads')
        self.temp_path = os.path.join(self.storage_path, 'temp')
        
        # Создаем необходимые директории
        for path in [self.storage_path, self.uploads_path, self.temp_path]:
            if not os.path.exists(path):
                os.makedirs(path)

    def save_file(self, file, user_id, device_id):
        """Сохраняет файл в структурированном виде"""
        # Генерируем безопасное имя файла
        filename = secure_filename(file.filename)
        
        # Создаем структуру директорий: storage/uploads/user_id/YYYY/MM/DD/
        today = datetime.now()
        relative_path = os.path.join(
            str(user_id),
            str(today.year),
            str(today.month).zfill(2),
            str(today.day).zfill(2)
        )
        
        full_path = os.path.join(self.uploads_path, relative_path)
        if not os.path.exists(full_path):
            os.makedirs(full_path)
        
        # Создаем уникальное имя файла
        unique_filename = self._generate_unique_filename(filename)
        file_path = os.path.join(full_path, unique_filename)
        
        # Сначала сохраняем во временную директорию
        temp_path = os.path.join(self.temp_path, unique_filename)
        file.save(temp_path)
        
        # Вычисляем MD5 хеш
        checksum = self._calculate_md5(temp_path)
        
        # Перемещаем файл в конечную директорию
        shutil.move(temp_path, file_path)
        
        # Создаем запись в БД
        db_file = File(
            user_id=user_id,
            device_id=device_id,
            file_path=os.path.join(relative_path, unique_filename),
            original_name=filename,
            mime_type=file.content_type,
            size=os.path.getsize(file_path),
            checksum=checksum
        )
        
        db.session.add(db_file)
        db.session.commit()
        
        return db_file

    def get_file(self, file_id):
        """Получает файл по ID"""
        return File.query.get_or_404(file_id)

    def get_file_path(self, file):
        """Получает полный путь к файлу"""
        return os.path.join(self.uploads_path, file.file_path)

    def delete_file(self, file_id):
        """Удаляет файл с диска и из БД"""
        file = self.get_file(file_id)
        file_path = self.get_file_path(file)
        
        # Удаляем файл с диска
        if os.path.exists(file_path):
            os.remove(file_path)
            
            # Пытаемся удалить пустые директории
            dir_path = os.path.dirname(file_path)
            while dir_path != self.uploads_path:
                if not os.listdir(dir_path):
                    os.rmdir(dir_path)
                    dir_path = os.path.dirname(dir_path)
                else:
                    break
        
        # Удаляем запись из БД
        db.session.delete(file)
        db.session.commit()

    def increment_download_count(self, file):
        """Увеличивает счетчик скачиваний"""
        file.download_count += 1
        db.session.commit()

    def _generate_unique_filename(self, original_filename):
        """Генерирует уникальное имя файла"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        name, ext = os.path.splitext(original_filename)
        unique_string = hashlib.md5(f"{name}{timestamp}".encode()).hexdigest()
        return f"{unique_string}{ext}"

    def _calculate_md5(self, file_path):
        """Вычисляет MD5 хеш файла"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()