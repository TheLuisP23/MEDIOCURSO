# Infraestructura de la app (spec 005, ADR 0002). La aplica GitHub Actions en
# cada merge a main. El estado vive en el bucket que crea infra/bootstrap/:
#   terraform init -backend-config="bucket=<TF_STATE_BUCKET>" -backend-config="region=<AWS_REGION>"

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    key          = "reserva-labs/terraform.tfstate"
    encrypt      = true
    use_lockfile = true # bloqueo nativo de S3: dos applies a la vez no se pisan
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Proyecto = "reserva-labs"
      Gestion  = "terraform"
    }
  }
}

data "aws_caller_identity" "actual" {}
