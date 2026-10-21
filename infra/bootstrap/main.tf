# Arranque inicial (spec 005, T1). Lo ejecuta A UNA SOLA VEZ desde su terminal,
# con su AWS CLI configurada. Crea lo que el resto de la infraestructura necesita
# para existir: el bucket del estado de Terraform y el rol que asume GitHub Actions.
# Su propio estado queda en local (terraform.tfstate, ignorado por git).

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Proyecto = "reserva-labs"
      Gestion  = "terraform-bootstrap"
    }
  }
}

variable "region" {
  description = "Región de AWS donde vive todo el proyecto."
  type        = string
  default     = "us-east-1"
}

variable "repositorio_github" {
  description = "Repositorio (dueño/nombre) cuyos workflows pueden asumir el rol de despliegue."
  type        = string
  default     = "TheLuisP23/MEDIOCURSO"
}

# GitHub puede emitir el `sub` del token con IDs inmutables (dueño@id/repo@id).
# Se ve con: gh api repos/<dueño>/<repo>/actions/oidc/customization/sub
variable "repositorio_github_inmutable" {
  description = "Mismo repositorio en formato inmutable: dueño@id_dueño/repo@id_repo."
  type        = string
  default     = "TheLuisP23@222698660/MEDIOCURSO@1427509967"
}

data "aws_caller_identity" "actual" {}
