variable "vmware_user" {
  description = "Utilisateur VMware Workstation"
  type        = string
}

variable "vmware_password" {
  description = "Mot de passe VMware Workstation"
  type        = string
  sensitive   = true
}


variable "vm_cpu" {
  description = "Nombre de CPUs par VM"
  type        = number
  default     = 2
}

variable "vm_ram" {
  description = "RAM en MB par VM"
  type        = number
  default     = 4096
}

variable "vm_disk" {
  description = "Disque en GB par VM"
  type        = number
  default     = 40
}


variable "iso_path" {
  description = "Chemin vers l'ISO Ubuntu Server 22.04"
  type        = string
}



variable "network_prefix" {
  description = "Préfixe réseau Host-Only"
  type        = string
  default     = "192.168.20"
}


variable "source_vm_id" {
  description = "ID de la VM source à cloner"
  type        = string
}
