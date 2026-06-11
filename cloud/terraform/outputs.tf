output "staging_public_ip" {
  description = "IP publique de la VM staging"
  value       = aws_instance.staging.public_ip
}

output "staging_rds_endpoint" {
  description = "Endpoint RDS staging"
  value       = aws_db_instance.staging.endpoint
}