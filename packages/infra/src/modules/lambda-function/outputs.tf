output "function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.lambda.arn
}

output "function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.lambda.function_name
}

output "function_invoke_arn" {
  description = "Lambda function invoke ARN"
  value       = aws_lambda_function.lambda.invoke_arn
}

output "security_group_id" {
  description = "Lambda security group ID"
  value       = var.vpc_id != null ? aws_security_group.lambda_sg[0].id : null
}

