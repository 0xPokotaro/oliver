/// Facilitator APIクライアント

use crate::error::ApiError;
use serde::{Deserialize, Serialize};
use std::time::Duration;

/// Facilitator APIクライアントトレイト
#[allow(dead_code)] // テストでモック化するために使用
#[async_trait::async_trait]
pub trait FacilitatorClient: Send + Sync {
    /// Facilitator APIで決済を検証
    async fn verify_payment(
        &self,
        facilitator_url: &str,
        payment_payload: &str,
    ) -> Result<VerifyResponse, ApiError>;
    
    /// Facilitator APIで決済を実行（非同期、Fire-and-Forget）
    async fn settle_payment(
        &self,
        facilitator_url: &str,
        payment_payload: &str,
    );
}

/// デフォルト実装（既存の関数ベースの実装）
#[allow(dead_code)] // テストで使用予定
pub struct DefaultFacilitatorClient;

#[async_trait::async_trait]
impl FacilitatorClient for DefaultFacilitatorClient {
    async fn verify_payment(
        &self,
        facilitator_url: &str,
        payment_payload: &str,
    ) -> Result<VerifyResponse, ApiError> {
        verify_payment(facilitator_url, payment_payload).await
    }
    
    async fn settle_payment(
        &self,
        facilitator_url: &str,
        payment_payload: &str,
    ) {
        settle_payment(facilitator_url, payment_payload).await;
    }
}

/// 共有HTTPクライアント（タイムアウト設定付き）
fn create_client() -> reqwest::Client {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .unwrap_or_else(|_| reqwest::Client::new())
}

/// Facilitator APIの検証レスポンス
#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyResponse {
    pub valid: bool,
    #[serde(rename = "paymentId")]
    pub payment_id: String,
    pub payer: String,
    pub amount: String,
}

/// Facilitator APIの決済実行レスポンス
#[derive(Debug, Serialize, Deserialize)]
pub struct SettleResponse {
    #[serde(rename = "txHash")]
    pub tx_hash: String,
    #[serde(rename = "paymentId")]
    pub payment_id: String,
    pub settled: bool,
    #[serde(rename = "blockNumber")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub block_number: Option<String>,
}

/// Facilitator APIで決済を検証
pub async fn verify_payment(
    facilitator_url: &str,
    payment_payload: &str,
) -> Result<VerifyResponse, ApiError> {
    let url = format!("{}/verify", facilitator_url);
    
    let client = create_client();
    let response = client
        .post(&url)
        .json(&serde_json::json!({
            "payment": payment_payload
        }))
        .send()
        .await
        .map_err(|e| ApiError::InternalError(format!("Failed to call Facilitator API: {}", e)))?;

    let status = response.status();
    if !status.is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(ApiError::InternalError(format!(
            "Facilitator verify failed: {} {}",
            status, error_text
        )));
    }

    let verify_response: VerifyResponse = response
        .json()
        .await
        .map_err(|e| ApiError::InternalError(format!(
            "Failed to parse Facilitator response: {}", e
        )))?;

    if !verify_response.valid {
        return Err(ApiError::PaymentError {
            kind: crate::error::PaymentErrorKind::SignatureInvalid,
            code: "SIGNATURE_INVALID".to_string(),
        });
    }

    Ok(verify_response)
}

/// Facilitator APIで決済を実行（非同期、Fire-and-Forget）
pub async fn settle_payment(
    facilitator_url: &str,
    payment_payload: &str,
) {
    let url = format!("{}/settle", facilitator_url);
    let payment_payload = payment_payload.to_string();
    
    // Fire-and-Forgetで実行（エラーはログに記録される）
    tokio::spawn(async move {
        let client = create_client();
        match client
            .post(&url)
            .json(&serde_json::json!({
                "payment": payment_payload
            }))
            .send()
            .await
        {
            Ok(response) => {
                let status = response.status();
                if !status.is_success() {
                    let error_text = response
                        .text()
                        .await
                        .unwrap_or_else(|_| "Unknown error".to_string());
                    eprintln!("Facilitator settle failed: {} {}", status, error_text);
                } else {
                    match response.json::<SettleResponse>().await {
                        Ok(data) => {
                            println!(
                                "Payment settled: {}, txHash: {}",
                                data.payment_id, data.tx_hash
                            );
                        }
                        Err(e) => {
                            eprintln!("Failed to parse Facilitator settle response: {}", e);
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Failed to settle payment: {}", e);
            }
        }
    });
}

