output "alb_dns_name" {
  description = "DNS name of Application Load Balancer"
  value       = module.alb.dns_name
}

output "asg_name" {
  description = "Name of Auto Scaling Group"
  value       = module.asg.asg_name
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "domain_name" {
  description = "Domain name of the application"
  value       = var.domain_name
}

output "main_dns" {
  description = "Main domain DNS record"
  value       = module.dns.main_fqdn
}

output "www_dns" {
  description = "WWW domain DNS record"
  value       = module.dns.www_fqdn
}
