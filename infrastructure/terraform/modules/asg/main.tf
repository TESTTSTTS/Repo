resource "aws_security_group" "asg" {
  name        = "${var.environment}-asg-sg"
  description = "Security group for ASG instances"
  vpc_id      = var.vpc_id

  # Для фронтенда
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  # Для бэкенда
  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  # Для SSH
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-asg-sg"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

resource "aws_launch_template" "main" {
  name_prefix   = "${var.environment}-template"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  network_interfaces {
    associate_public_ip_address = false
    security_groups            = [aws_security_group.asg.id]
  }

  block_device_mappings {
    device_name = "/dev/sda1"
    ebs {
      volume_size = 15
      volume_type = "gp2"
      encrypted   = true
    }
  }

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  # Добавляем SSH ключ
  key_name = "deployer"

  user_data = base64encode(<<-EOF
              #!/bin/bash
              
              # Обновляем пакеты
              apt-get update
              apt-get install -y curl git nginx python3 python3-pip

              # Устанавливаем Node.js
              curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
              apt-get install -y nodejs

              # Создаем директорию приложения
              mkdir -p /app
              cd /app

              # Клонируем репозиторий (замените на ваш URL)
              git clone https://github.com/TESTTSTTS/Repo.git .

              # Устанавливаем зависимости и собираем фронтенд
              cd frontend
              npm install
              npm run build
              
              # Копируем собранный фронтенд в директорию Nginx
              rm -rf /var/www/html/*
              cp -r build/* /var/www/html/
              
              # Настраиваем Nginx
              cat > /etc/nginx/sites-available/default <<'EOL'
              server {
                  listen 80;
                  server_name localhost ${var.domain_name} www.${var.domain_name};
                  
                  location / {
                      root /var/www/html;
                      try_files $uri $uri/ /index.html;
                      index index.html;
                      
                      # Настройки CORS
                      add_header 'Access-Control-Allow-Origin' '*';
                      add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
                      add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
                  }

                  location /api {
                      proxy_pass http://localhost:8000;
                      proxy_http_version 1.1;
                      proxy_set_header Upgrade $http_upgrade;
                      proxy_set_header Connection 'upgrade';
                      proxy_set_header Host $host;
                      proxy_cache_bypass $http_upgrade;
                      
                      # Передаем реальный IP клиента
                      proxy_set_header X-Real-IP $remote_addr;
                      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                      proxy_set_header X-Forwarded-Proto $scheme;
                  }

                  # Добавим тестовый endpoint
                  location /health {
                      access_log off;
                      return 200 'healthy';
                      add_header Content-Type text/plain;
                  }
              }
              EOL

              # Перезапускаем Nginx
              systemctl restart nginx

              # Устанавливаем зависимости и запускаем бэкенд
              cd /app/backend
              pip3 install -r requirements.txt
              
              # Создаем systemd сервис для бэкенда
              cat > /etc/systemd/system/backend.service <<'EOL'
              [Unit]
              Description=Backend Service
              After=network.target

              [Service]
              User=root
              WorkingDirectory=/app/backend
              Environment="S3_BUCKET_NAME=${var.s3_bucket_name}"
              Environment="AWS_REGION=${data.aws_region.current.name}"
              Environment="AWS_ACCESS_KEY_ID=${var.aws_access_key}"
              Environment="AWS_SECRET_ACCESS_KEY=${var.aws_secret_key}"
              Environment="DOMAIN_NAME=${var.domain_name}"
              ExecStart=/usr/bin/python3 /app/backend/app.py
              StandardOutput=append:/var/log/backend.log
              StandardError=append:/var/log/backend.error.log
              Restart=always

              [Install]
              WantedBy=multi-user.target
              EOL

              # Запускаем бэкенд
              systemctl enable backend
              systemctl start backend
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.environment}-instance"
      Environment = var.environment
    }
  }
}

resource "aws_autoscaling_group" "main" {
  name                = "${var.environment}-asg"
  desired_capacity    = var.desired_capacity
  max_size            = var.max_size
  min_size            = var.min_size
  target_group_arns   = [var.target_group_arn]
  vpc_zone_identifier = var.subnet_ids

  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.environment}-asg"
    propagate_at_launch = true
  }
}

# Политика масштабирования по CPU
resource "aws_autoscaling_policy" "cpu_policy" {
  name                   = "${var.environment}-cpu-policy"
  autoscaling_group_name = aws_autoscaling_group.main.name
  policy_type           = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

resource "aws_autoscaling_policy" "scale_up" {
  name                   = "${var.environment}-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown              = 300
  autoscaling_group_name = aws_autoscaling_group.main.name
}

resource "aws_autoscaling_policy" "scale_down" {
  name                   = "${var.environment}-scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown              = 300
  autoscaling_group_name = aws_autoscaling_group.main.name
}

# Alarm для увеличения количества инстансов
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.environment}-high-cpu-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace          = "AWS/EC2"
  period             = "300"
  statistic          = "Average"
  threshold          = "75"
  alarm_description  = "Это срабатывает когда CPU > 75%"
  alarm_actions      = [aws_autoscaling_policy.scale_up.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.main.name
  }
}

# Alarm для уменьшения количества инстансов
resource "aws_cloudwatch_metric_alarm" "low_cpu" {
  alarm_name          = "${var.environment}-low-cpu-alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace          = "AWS/EC2"
  period             = "300"
  statistic          = "Average"
  threshold          = "30"
  alarm_description  = "Это срабатывает когда CPU < 30%"
  alarm_actions      = [aws_autoscaling_policy.scale_down.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.main.name
  }
}

# Алармы для RAM
resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "${var.environment}-high-memory-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "mem_used_percent"
  namespace          = "CWAgent"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "Это срабатывает когда использование RAM > 80%"
  alarm_actions      = [aws_autoscaling_policy.scale_up.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.main.name
  }
}

# Alarm для уменьшения количества инстансов по RAM
resource "aws_cloudwatch_metric_alarm" "low_memory" {
  alarm_name          = "${var.environment}-low-memory-alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "mem_used_percent"
  namespace          = "CWAgent"
  period             = "300"
  statistic          = "Average"
  threshold          = "20"
  alarm_description  = "Это срабатывает когда использование RAM < 20%"
  alarm_actions      = [aws_autoscaling_policy.scale_down.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.main.name
  }
}

# Политика масштабирования по RAM
resource "aws_autoscaling_policy" "memory_policy" {
  name                   = "${var.environment}-memory-policy"
  autoscaling_group_name = aws_autoscaling_group.main.name
  policy_type           = "TargetTrackingScaling"

  target_tracking_configuration {
    customized_metric_specification {
      metric_dimension {
        name  = "AutoScalingGroupName"
        value = aws_autoscaling_group.main.name
      }
      metric_name = "mem_used_percent"
      namespace   = "CWAgent"
      statistic   = "Average"
    }
    target_value = 70.0
  }
}

# IAM роль для EC2
resource "aws_iam_role" "ec2_role" {
  name = var.instance_profile_name

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Политика для доступа к S3
resource "aws_iam_role_policy" "s3_policy" {
  name = "${var.environment}-s3-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_name}",
          "arn:aws:s3:::${var.s3_bucket_name}/*"
        ]
      }
    ]
  })
}

# Политика для CloudWatch
resource "aws_iam_role_policy" "cloudwatch_policy" {
  name = "${var.environment}-cloudwatch-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "ec2:DescribeVolumes",
          "ec2:DescribeTags",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "logs:DescribeLogGroups",
          "logs:CreateLogStream",
          "logs:CreateLogGroup"
        ]
        Resource = "*"
      }
    ]
  })
}

# Профиль для EC2
resource "aws_iam_instance_profile" "ec2_profile" {
  name = var.instance_profile_name
  role = aws_iam_role.ec2_role.name
} 