terraform {
  required_providers {
    vmworkstation = {
      source  = "elsudano/vmworkstation"
      version = "1.0.4"
    }
  }
}

provider "vmworkstation" {
  user     = "aya_admin"
  password = "Aya@123!"
  url      = "http://192.168.174.1:8697/api"
  https    = false
  debug    = true
}
