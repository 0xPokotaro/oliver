# RDS Variables

variable "rds_instance_identifier" {
  description = "RDS instance identifier"
  type        = string
  default     = "oliver-db-dev"
}

variable "rds_engine" {
  description = "RDS database engine"
  type        = string
  default     = "postgres"
}

variable "rds_engine_version" {
  description = "RDS database engine version"
  type        = string
  default     = "15.4"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "rds_db_name" {
  description = "RDS database name"
  type        = string
  default     = "oliver"
}

variable "rds_db_username" {
  description = "RDS database master username"
  type        = string
  sensitive   = true
  default     = "postgres"
}

variable "rds_db_password" {
  description = "RDS database master password"
  type        = string
  sensitive   = true
}
