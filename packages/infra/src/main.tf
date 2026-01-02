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

        # PORT環境変数はCloud Runが自動的に設定するため、手動設定は不要
        # container_portで指定したポート番号が自動的にPORT環境変数に設定される

        # 起動プローブの設定（コンテナの起動を待つ時間を延長）
        startup_probe {
          http_get {
            path = "/api/health"
            port = 3001
          }
          initial_delay_seconds = 10 # 10秒待ってからチェック開始
          timeout_seconds       = 2 # period_secondsより小さくする必要がある
          period_seconds        = 3
          failure_threshold     = 20 # 最大60秒待つ（3秒 × 20回）
        }

        # ヘルスチェック（起動後の生存確認）
        liveness_probe {
          http_get {
            path = "/api/health"
            port = 3001
          }
          timeout_seconds   = 9 # period_secondsより小さくする（念のため）
          period_seconds    = 10
          failure_threshold = 3
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
