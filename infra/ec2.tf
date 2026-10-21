# Una sola instancia: nginx sirve el frontend y reenvía /api/* al backend (Node).

# Última AMI de Amazon Linux 2023 para ARM, publicada por AWS en SSM.
data "aws_ssm_parameter" "ami_al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

resource "aws_instance" "app" {
  ami                    = data.aws_ssm_parameter.ami_al2023.insecure_value
  instance_type          = var.tipo_instancia
  iam_instance_profile   = aws_iam_instance_profile.app.name
  vpc_security_group_ids = [aws_security_group.app.id]

  user_data = templatefile("${path.module}/arranque.sh.tftpl", {
    tabla        = aws_dynamodb_table.reservas.name
    region       = var.region
    version_node = var.version_node
  })
  # Si cambia el arranque, se crea una instancia nueva (los datos están en DynamoDB).
  user_data_replace_on_change = true

  metadata_options {
    http_tokens = "required" # IMDSv2
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 8
    encrypted   = true
  }

  tags = {
    Name = var.nombre
  }

  # Sin esto, cada AMI nueva que publique AWS reemplazaría la instancia en el siguiente apply.
  lifecycle {
    ignore_changes = [ami]
  }
}

# IP fija: la URL no cambia aunque la instancia se reemplace.
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name = var.nombre
  }
}
