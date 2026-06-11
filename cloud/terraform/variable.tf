variable "aws_region" {
  default = "eu-central-1"
}

variable "key_name" {
  default = "key-vm1"
}

variable "db_password_staging" {
  description = "Mot de passe RDS staging"
  type        = string
  sensitive   = true
}