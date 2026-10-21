output "url_app" {
  description = "URL pública de la aplicación."
  value       = "http://${aws_eip.app.public_ip}"
}

output "id_instancia" {
  description = "Id de la EC2 (destino de los comandos SSM del despliegue)."
  value       = aws_instance.app.id
}

output "bucket_artefactos" {
  description = "Bucket donde GitHub Actions sube cada versión."
  value       = aws_s3_bucket.artefactos.bucket
}

output "tabla_reservas" {
  description = "Nombre de la tabla DynamoDB."
  value       = aws_dynamodb_table.reservas.name
}
