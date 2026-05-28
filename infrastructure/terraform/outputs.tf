output "vm_chef_id" {
  description = "ID de VM-Chef"
  value       = vmworkstation_vm.vm_chef.id
}

output "vm_adjoint_id" {
  description = "ID de VM-Adjoint"
  value       = vmworkstation_vm.vm_adjoint.id
}

output "vm_chef_db_id" {
  description = "ID de VM-Chef-DB"
  value       = vmworkstation_vm.vm_chef_db.id
}

output "vm_adjoint_db_id" {
  description = "ID de VM-Adjoint-DB"
  value       = vmworkstation_vm.vm_adjoint_db.id
}
