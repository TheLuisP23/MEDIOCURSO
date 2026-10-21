# GitHub Actions entra a AWS por OIDC: pide un token temporal en cada ejecución,
# sin claves de AWS guardadas en GitHub (ADR 0002).

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

data "aws_iam_policy_document" "confianza_github" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Solo los workflows de este repositorio (cualquier rama o PR del propio repo),
    # en el formato clásico o en el inmutable con IDs.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.repositorio_github}:*",
        "repo:${var.repositorio_github_inmutable}:*",
      ]
    }
  }
}

resource "aws_iam_role" "github" {
  name               = "reserva-labs-github"
  description        = "Rol que asume GitHub Actions para aplicar Terraform y desplegar (spec 005)."
  assume_role_policy = data.aws_iam_policy_document.confianza_github.json
}

# Terraform crea roles IAM, así que necesita permisos amplios. Aceptado para el
# curso en plan.md (Riesgos); la confianza del rol se limita al repositorio.
resource "aws_iam_role_policy_attachment" "github_admin" {
  role       = aws_iam_role.github.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
