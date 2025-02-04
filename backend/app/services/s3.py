import boto3
from flask import current_app
import uuid

class S3Service:
    def __init__(self):
        # Проверяем наличие необходимых конфигураций
        required_configs = [
            'AWS_ENDPOINT_URL',
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'S3_BUCKET_NAME',
            'AWS_REGION'
        ]
        
        for config in required_configs:
            if not current_app.config.get(config):
                raise ValueError(f"Missing required config: {config}")

        self.s3 = boto3.client(
            's3',
            endpoint_url=current_app.config['AWS_ENDPOINT_URL'],
            aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
            region_name=current_app.config['AWS_REGION'],
            config=boto3.session.Config(
                signature_version='s3v4',
                retries={'max_attempts': 3}
            )
        )
        self.bucket = current_app.config['S3_BUCKET_NAME']

    def upload_file(self, file_data, content_type):
        try:
            # Проверка размера файла (макс. 10MB)
            file_data.seek(0, 2)
            size = file_data.tell()
            if size > 10 * 1024 * 1024:
                raise ValueError("File too large (max 10MB)")
            file_data.seek(0)

            file_id = str(uuid.uuid4())
            key = f"uploads/{file_id}/{file_data.filename}"
            
            self.s3.upload_fileobj(
                file_data,
                self.bucket,
                key,
                ExtraArgs={
                    'ContentType': content_type,
                    'ACL': 'private'
                }
            )
            return key
        except Exception as e:
            current_app.logger.error(f"Error uploading to S3: {str(e)}")
            raise

    def get_presigned_url(self, s3_key, expires_in=3600):
        try:
            return self.s3.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': s3_key
                },
                ExpiresIn=expires_in
            )
        except Exception as e:
            current_app.logger.error(f"Error generating presigned URL: {str(e)}")
            raise

def get_s3_client():
    return boto3.client(
        's3',
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
        region_name=current_app.config['AWS_REGION']
    )

def upload_file(file_data, filename):
    s3_client = get_s3_client()
    try:
        s3_client.put_object(
            Bucket=current_app.config['S3_BUCKET_NAME'],
            Key=filename,
            Body=file_data
        )
        return True
    except Exception as e:
        current_app.logger.error(f"Error uploading to S3: {str(e)}")
        return False

def get_file_url(filename):
    s3_client = get_s3_client()
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': current_app.config['S3_BUCKET_NAME'],
                'Key': filename
            },
            ExpiresIn=3600  # URL действителен 1 час
        )
        return url
    except Exception as e:
        current_app.logger.error(f"Error generating presigned URL: {str(e)}")
        return None 