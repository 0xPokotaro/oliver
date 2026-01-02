# Cloud Run Service Account
resource "google_service_account" "cloud_run" {
  account_id   = "${var.service_name}-sa"
  display_name = "Cloud Run Service Account for ${var.service_name}"
}

# Cloud Run Service
resource "google_cloud_run_service" "service" {
  name     = var.service_name
  location = var.gcp_region

  template {
    spec {
      service_account_name = google_service_account.cloud_run.email
      timeout_seconds      = 300 # 5分（デフォルトは300秒）
      containers {
        image = var.container_image
        ports {
          container_port = 3001
        }

        # PORT環境変数を明示的に設定（Cloud Runが自動設定するが、明示的に指定）
        env {
          name  = "PORT"
          value = "3001"
        }

        dynamic "env" {
          for_each = var.environment
          content {
            name  = env.key
            value = env.value
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# IAM: Allow unauthenticated access (公開API)
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.service.name
  location = google_cloud_run_service.service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
