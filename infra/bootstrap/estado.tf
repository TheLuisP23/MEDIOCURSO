# Bucket donde vive el estado de Terraform de infra/ (compartido por A, B y
# GitHub Actions). El nombre incluye el número de cuenta para que sea único.

resource "aws_s3_bucket" "estado" {
  bucket = "reserva-labs-tfstate-${data.aws_caller_identity.actual.account_id}"

  # Borrarlo dejaría a Terraform sin saber qué creó.
  lifecycle {
    prevent_destroy = true
  }
}

# Versionado: permite recuperar un estado anterior si uno se corrompe.
resource "aws_s3_bucket_versioning" "estado" {
  bucket = aws_s3_bucket.estado.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "estado" {
  bucket = aws_s3_bucket.estado.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "estado" {
  bucket = aws_s3_bucket.estado.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
