terraform {
  required_providers {
    vmworkstation = {
      source  = "elsudano/vmworkstation"
      version = "~> 0.8"
    }
  }
}

provider "vmworkstation" {
  user     = var.vmware_user
  password = var.vmware_password
  url      = "https://localhost:8697"
  https    = true
}
