output "api_url" {
  description = "API Gateway URL"
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "api_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.api.id
}

output "stage_id" {
  description = "API Gateway stage ID"
  value       = aws_apigatewayv2_stage.stage.id
}

