resource "vmworkstation_vm" "vm_chef" {
  denomination = "VM-Chef"
  description  = "Serveur DevSecOps Staging"
  cpus         = var.vm_cpu
  memory       = var.vm_ram
  path         = "/home/aya/vmware/VM-Chef"
}


resource "vmworkstation_vm" "vm_adjoint" {
  denomination = "VM-Adjoint"
  description  = "Serveur DevSecOps Production"
  cpus         = var.vm_cpu
  memory       = var.vm_ram
  path         = "/home/aya/vmware/VM-Adjoint"
}



resource "vmworkstation_vm" "vm_chef_db" {
  denomination = "VM-Chef-DB"
  description  = "Serveur PostgreSQL Staging"
  cpus         = 1
  memory       = 1024
  path         = "/home/aya/vmware/VM-Chef-DB"
}



resource "vmworkstation_vm" "vm_adjoint_db" {
  denomination = "VM-Adjoint-DB"
  description  = "Serveur PostgreSQL Production"
  cpus         = 1
  memory       = 1024
  path         = "/home/aya/vmware/VM-Adjoint-DB"
}
