# Rol de la EC2: SSM para desplegar sin SSH, la tabla de reservas y la lectura
# de los artefactos. Nada más.

data "aws_iam_policy_document" "confianza_ec2" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "app" {
  name               = "${var.nombre}-app"
  assume_role_policy = data.aws_iam_policy_document.confianza_ec2.json
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "app" {
  statement {
    sid = "TablaReservas"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:BatchGetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
    ]
    resources = [
      aws_dynamodb_table.reservas.arn,
      "${aws_dynamodb_table.reservas.arn}/index/*",
    ]
  }

  statement {
    sid       = "LeerArtefactos"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.artefactos.arn}/*"]
  }
}

resource "aws_iam_role_policy" "app" {
  name   = "acceso-app"
  role   = aws_iam_role.app.id
  policy = data.aws_iam_policy_document.app.json
}

resource "aws_iam_instance_profile" "app" {
  name = "${var.nombre}-app"
  role = aws_iam_role.app.name
}
