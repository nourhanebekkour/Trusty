terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Récupère les ressources existantes
data "aws_vpc" "trusty" {
  id = "vpc-0d418a407bd2a333f"
}

data "aws_subnet" "public" {
  id = "subnet-01828eac0f6d8812c"
}

data "aws_security_group" "ec2" {
  id = "sg-0d5579224f80db16a"
}

data "aws_security_group" "rds" {
  id = "sg-089e67bcd6267441e"
}