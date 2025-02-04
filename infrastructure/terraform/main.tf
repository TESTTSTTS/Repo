module "vpc" {
  source = "./modules/vpc"

  environment          = var.environment
  vpc_cidr            = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

module "security" {
  source = "./modules/security"

  environment = "${var.environment}-v2"
  vpc_id      = module.vpc.vpc_id
}

# Используем существующий S3 бакет вместо создания нового
data "aws_s3_bucket" "existing" {
  bucket = "prod-static-files-cvnq-xyz-2025"
}

module "alb" {
  source = "./modules/alb"

  environment       = "${var.environment}-v2"
  vpc_id           = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  security_groups   = [module.security.alb_sg_id]
}

# Добавляем ресурс для генерации случайного суффикса
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Создаем ключевую пару в AWS из существующего публичного ключа
resource "aws_key_pair" "deployer" {
  key_name   = "deployer"
  public_key = file("${path.module}/ssh/deployer.pub")
}

module "asg" {
  source = "./modules/asg"

  environment         = "${var.environment}-v2"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  target_group_arn   = module.alb.target_group_arn
  alb_security_group_id = module.security.alb_sg_id
  
  instance_type      = var.instance_type
  min_size          = var.asg_min_size
  max_size          = var.asg_max_size
  desired_capacity  = var.asg_desired_capacity
  s3_bucket_name    = data.aws_s3_bucket.existing.id
  
  instance_profile_name = "${var.environment}-ec2-profile-${random_string.suffix.result}"

  depends_on = [aws_key_pair.deployer]
}

module "dns" {
  source = "./modules/dns"

  domain_name   = var.domain_name
  alb_dns_name  = module.alb.dns_name
  alb_zone_id   = module.alb.zone_id
}

# Получаем IP адрес инстанса из ASG
data "aws_instances" "asg_instances" {
  depends_on = [module.asg]
  
  instance_tags = {
    "aws:autoscaling:groupName" = module.asg.asg_name
  }

  filter {
    name   = "instance-state-name"
    values = ["running"]
  }
}

resource "time_sleep" "wait_for_instance" {
  depends_on = [module.asg, module.vpc]
  
  create_duration = "90s"
}

resource "null_resource" "run_ansible" {
  depends_on = [
    module.asg,
    module.alb,
    data.aws_instances.asg_instances,
    time_sleep.wait_for_instance
  ]

  triggers = {
    asg_name = module.asg.asg_name
    instance_id = data.aws_instances.asg_instances.ids[0]
  }

  provisioner "local-exec" {
    command = <<-EOT
      Start-Sleep -Seconds 30
      $instance_id = '${data.aws_instances.asg_instances.ids[0]}'
      
      # Получаем AWS credentials из профиля
      $env:AWS_ACCESS_KEY_ID = $(aws configure get aws_access_key_id --profile default)
      $env:AWS_SECRET_ACCESS_KEY = $(aws configure get aws_secret_access_key --profile default)
      $env:AWS_DEFAULT_REGION = '${data.aws_region.current.name}'
      
      # Создаем директорию для inventory если её нет
      New-Item -Path "../ansible/inventory" -ItemType Directory -Force

      $inventory_content = @"
[app_servers]
app_server ansible_host=$instance_id

[all:vars]
ansible_connection="aws_ssm"
ansible_aws_ssm_region="${data.aws_region.current.name}"
ansible_python_interpreter="/usr/bin/python3"
ansible_shell_executable="/bin/sh"
ansible_aws_ssm_plugin="/usr/local/aws-cli/v2/current/bin/aws"
ansible_aws_ssm_retries="5"
ansible_become="yes"
ansible_become_method="sudo"
"@

      Set-Content -Path "../ansible/inventory/hosts.tmp" -Value $inventory_content -Force
      
      # Пересоздаем контейнер для обновления образа
      docker-compose -f ../docker-compose.yml build --no-cache ansible
      docker-compose -f ../docker-compose.yml up ansible
    EOT
    interpreter = ["PowerShell", "-Command"]
    environment = {
      ANSIBLE_HOST_KEY_CHECKING = "False"
    }
  }
}

# Получаем текущий регион
data "aws_region" "current" {}
