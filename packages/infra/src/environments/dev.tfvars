# Development Environment Configuration

# Common
gcp_project_id = "your-project-id"
gcp_region     = "asia-northeast1"

# Cloud Run
service_name    = "oliver-api-dev"
container_image = "gcr.io/your-project-id/oliver-api-dev:latest"

environment = {
  DATABASE_URL = "postgresql://user:password@host:5432/db"
}
