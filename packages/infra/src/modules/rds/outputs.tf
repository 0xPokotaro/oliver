output "db_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.rds.id
}

output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.rds.endpoint
}

output "db_instance_address" {
  description = "RDS instance address"
  value       = aws_db_instance.rds.address
}

output "db_instance_port" {
  description = "RDS instance port"
  value       = aws_db_instance.rds.port
}

output "database_url" {
  description = "Database connection URL"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.rds.address}:${aws_db_instance.rds.port}/${var.db_name}"
  sensitive   = true
}

output "security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds_sg.id
}

