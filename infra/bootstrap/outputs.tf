# Estos valores se copian como variables del repositorio en GitHub (T2).

output "region" {
  description = "Variable de GitHub AWS_REGION."
  value       = var.region
}

output "rol_github_arn" {
  description = "Variable de GitHub AWS_ROLE_ARN."
  value       = aws_iam_role.github.arn
}

output "bucket_estado" {
  description = "Variable de GitHub TF_STATE_BUCKET."
  value       = aws_s3_bucket.estado.bucket
}
