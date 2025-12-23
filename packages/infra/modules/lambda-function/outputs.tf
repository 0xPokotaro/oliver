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

