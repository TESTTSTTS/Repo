output "main_fqdn" {
  value = aws_route53_record.main.fqdn
}

output "www_fqdn" {
  value = aws_route53_record.www.fqdn
} 