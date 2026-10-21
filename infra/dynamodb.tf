# Tabla Reservas: mismo modelo que docs/arquitectura.md (no cambiar sin ADR).

resource "aws_dynamodb_table" "reservas" {
  name         = "${var.nombre}-reservas"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "usuario"
    type = "S"
  }

  attribute {
    name = "fechaHora"
    type = "S"
  }

  global_secondary_index {
    name            = "porUsuario"
    projection_type = "ALL"

    key_schema {
      attribute_name = "usuario"
      key_type       = "HASH"
    }

    key_schema {
      attribute_name = "fechaHora"
      key_type       = "RANGE"
    }
  }

  # Las reservas deben sobrevivir a cualquier despliegue o reemplazo de la EC2 (CA-21).
  lifecycle {
    prevent_destroy = true
  }
}
