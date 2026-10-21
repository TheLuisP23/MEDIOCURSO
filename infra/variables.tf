variable "region" {
  description = "Región de AWS (la misma del bootstrap)."
  type        = string
  default     = "us-east-1"
}

variable "nombre" {
  description = "Prefijo de los nombres de los recursos."
  type        = string
  default     = "reserva-labs"
}

variable "tipo_instancia" {
  description = "Tipo de la EC2. Debe ser ARM (Graviton, familia t4g): la AMI es arm64."
  type        = string
  default     = "t4g.micro"
}

variable "version_node" {
  description = "Versión de Node.js que se instala en la EC2 (descarga oficial de nodejs.org)."
  type        = string
  default     = "22.12.0"
}
