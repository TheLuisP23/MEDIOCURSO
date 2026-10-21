# Bucket privado con el .tar.gz de cada versión (backend + frontend).
# GitHub Actions lo sube y la EC2 lo descarga al desplegar.

resource "aws_s3_bucket" "artefactos" {
  bucket        = "${var.nombre}-artefactos-${data.aws_caller_identity.actual.account_id}"
  force_destroy = true # solo guarda copias reproducibles desde git
}

resource "aws_s3_bucket_public_access_block" "artefactos" {
  bucket = aws_s3_bucket.artefactos.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "artefactos" {
  bucket = aws_s3_bucket.artefactos.id

  rule {
    id     = "borrar-versiones-viejas"
    status = "Enabled"

    filter {}

    expiration {
      days = 30
    }
  }
}
