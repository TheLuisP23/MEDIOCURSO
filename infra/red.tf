# VPC por defecto de la cuenta. Solo entra HTTP (80): sin SSH, la instancia se
# administra con SSM (Session Manager / Run Command).

data "aws_vpc" "defecto" {
  default = true
}

resource "aws_security_group" "app" {
  name        = "${var.nombre}-app"
  description = "Entrada HTTP a la app de reservas"
  vpc_id      = data.aws_vpc.defecto.id
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  security_group_id = aws_security_group.app.id
  description       = "HTTP publico"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "todo" {
  security_group_id = aws_security_group.app.id
  description       = "Salida libre (paquetes, DynamoDB, S3, SSM)"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}
