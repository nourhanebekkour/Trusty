resource "aws_db_instance" "staging" {
  identifier        = "trusty-staging-db"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "postgres"
  username = "postgres"
  password = var.db_password_staging

  db_subnet_group_name   = "trusty-db-subnet-group"
  vpc_security_group_ids = [data.aws_security_group.rds.id]

  skip_final_snapshot = true
  publicly_accessible = false
  multi_az            = false

  tags = {
    Name = "trusty-staging-db"
  }
}