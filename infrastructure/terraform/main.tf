
resource "vmworkstation_vm" "vm_chef" {
  denomination = "VM-Chef"
  description  = "Serveur DevSecOps Staging"
  processors   = var.vm_cpu
  memory       = var.vm_ram
  sourceid     = var.source_vm_id
  path         = "C:\\Users\\aya el jebari\\Documents\\Virtual Machines\\VM-Chef\\VM-Chef.vmx"
}


resource "vmworkstation_vm" "vm_adjoint" {
  denomination = "VM-Adjoint"
  description  = "Serveur DevSecOps Production"
  processors   = var.vm_cpu
  memory       = var.vm_ram
  sourceid     = var.source_vm_id
  path         = "C:\\Users\\aya el jebari\\Documents\\Virtual Machines\\VM-Adjoint\\VM-Adjoint.vmx"
}


resource "vmworkstation_vm" "vm_chef_db" {
  denomination = "VM-Chef-DB"
  description  = "Serveur PostgreSQL Staging"
  processors   = 1
  memory       = 1024
  sourceid     = var.source_vm_id
  path         = "C:\\Users\\aya el jebari\\Documents\\Virtual Machines\\VM-Chef-DB\\VM-Chef-DB.vmx"
}


resource "vmworkstation_vm" "vm_adjoint_db" {
  denomination = "VM-Adjoint-DB"
  description  = "Serveur PostgreSQL Production"
  processors   = 1
  memory       = 1024
  sourceid     = var.source_vm_id
  path         = "C:\\Users\\aya el jebari\\Documents\\Virtual Machines\\VM-Adjoint-DB\\VM-Adjoint-DB.vmx"
}
