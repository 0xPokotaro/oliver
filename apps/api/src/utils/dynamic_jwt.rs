/// Dynamic JWT検証ユーティリティ

use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use base64::Engine;
use rsa::pkcs1::EncodeRsaPublicKey;
use crate::error::{ApiError, error_codes};

/// Dynamic JWTペイロード
#[derive(Debug, Serialize, Deserialize)]
struct DynamicJwtPayload {
    sub: String, // dynamic_user_id
    #[serde(rename = "verified_credentials")]
    verified_credentials: Option<Vec<VerifiedCredential>>,
    scopes: Option<Vec<String>>,
    #[serde(flatten)]
    extra: serde_json::Map<String, Value>,
}

/// 検証済みクレデンシャル
#[derive(Debug, Serialize, Deserialize)]
struct VerifiedCredential {
    address: Option<String>,
    #[serde(flatten)]
    extra: serde_json::Map<String, Value>,
}

/// Dynamic JWKSレスポンス
#[derive(Debug, Deserialize)]
struct JwksResponse {
    keys: Vec<Jwk>,
}

/// JSON Web Key
#[derive(Debug, Deserialize)]
struct Jwk {
    #[serde(rename = "kty")]
    key_type: String,
    #[serde(rename = "kid")]
    key_id: String, // serdeでkidとしてデシリアライズされるが、フィールド名はkey_id
    #[serde(rename = "use")]
    #[allow(dead_code)]
    use_type: Option<String>,
    #[allow(dead_code)]
    alg: Option<String>,
    n: Option<String>,
    e: Option<String>,
}

/// JWT検証結果
pub struct JwtVerificationResult {
    pub dynamic_user_id: String,
    pub wallet_address: String,
}

/// Dynamic JWTトークンを検証し、ユーザー情報を抽出
pub async fn verify_dynamic_jwt(
    token: &str,
    dynamic_env_id: &str,
) -> Result<JwtVerificationResult, ApiError> {
    tracing::info!("Starting JWT verification for dynamic_env_id: {}", dynamic_env_id);

    // 1. JWTヘッダーからkidを取得
    let header = decode_header(token).map_err(|e| {
        tracing::error!("Failed to decode JWT header: {}", e);
        ApiError::Unauthorized {
            code: Some(error_codes::INVALID_TOKEN.to_string()),
        }
    })?;

    tracing::debug!("JWT header decoded successfully");

    let kid = header.kid.ok_or_else(|| {
        tracing::error!("JWT header missing 'kid' field");
        ApiError::Unauthorized {
            code: Some(error_codes::INVALID_TOKEN.to_string()),
        }
    })?;

    tracing::info!("Extracted kid from JWT header: {}", kid);

    // 2. JWKSを取得
    let jwks_url = format!(
        "https://app.dynamic.xyz/api/v0/sdk/{}/.well-known/jwks",
        dynamic_env_id
    );
    
    tracing::debug!("Fetching JWKS from: {}", jwks_url);
    let jwks = fetch_jwks(&jwks_url).await?;
    tracing::info!("JWKS fetched successfully, found {} keys", jwks.keys.len());

    // 3. kidに一致するキーを検索
    let jwk = jwks.keys.iter().find(|k| k.key_id == kid).ok_or_else(|| {
        tracing::error!("JWK with kid '{}' not found", kid);
        ApiError::Unauthorized {
            code: Some(error_codes::INVALID_TOKEN.to_string()),
        }
    })?;

    tracing::info!("Found matching JWK with kid: {}", kid);

    // 4. RSA公開鍵を構築
    tracing::debug!("Building RSA decoding key");
    let decoding_key = build_decoding_key(jwk)?;
    tracing::debug!("RSA decoding key built successfully");

    // 5. JWTを検証
    tracing::debug!("Verifying JWT signature");
    let mut validation = Validation::new(Algorithm::RS256);
    validation.validate_aud = false; // DynamicのJWTはaudがフロントエンドのオリジンなのでバックエンドでは検証しない
    let token_data = decode::<DynamicJwtPayload>(token, &decoding_key, &validation).map_err(|e| {
        tracing::error!("Failed to verify JWT: {}", e);
        ApiError::Unauthorized {
            code: Some(error_codes::INVALID_TOKEN.to_string()),
        }
    })?;

    tracing::info!("JWT signature verified successfully");
    let payload = token_data.claims;

    // 6. MFAチェック
    if let Some(ref scopes) = payload.scopes {
        tracing::debug!("Checking MFA scopes: {:?}", scopes);
        if scopes.contains(&"requiresAdditionalAuth".to_string()) {
            tracing::error!("JWT requires additional authentication");
            return Err(ApiError::Unauthorized {
                code: Some(error_codes::REQUIRES_ADDITIONAL_AUTH.to_string()),
            });
        }
    }

    // 7. wallet_addressを取得（payloadを借用）
    let wallet_address = extract_wallet_address(&payload)?;
    tracing::debug!("Extracted wallet_address: {}", wallet_address);

    // 8. dynamic_user_idを取得（payloadをムーブ）
    let dynamic_user_id = payload.sub.clone();
    tracing::debug!("Extracted dynamic_user_id: {}", dynamic_user_id);

    tracing::info!(
        "JWT verification completed successfully - dynamic_user_id: {}, wallet_address: {}",
        dynamic_user_id,
        wallet_address
    );

    Ok(JwtVerificationResult {
        dynamic_user_id,
        wallet_address,
    })
}

/// JWKSを取得
async fn fetch_jwks(jwks_url: &str) -> Result<JwksResponse, ApiError> {
    let response = reqwest::get(jwks_url)
        .await
        .map_err(|e| {
            tracing::error!("Failed to fetch JWKS: {}", e);
            ApiError::InternalError(format!("Failed to fetch JWKS: {}", e))
        })?;

    let status = response.status();
    tracing::debug!("JWKS endpoint returned status: {}", status);

    if !status.is_success() {
        tracing::error!("JWKS endpoint returned non-success status: {}", status);
        return Err(ApiError::InternalError(format!(
            "JWKS endpoint returned status: {}",
            status
        )));
    }

    let jwks: JwksResponse = response.json().await.map_err(|e| {
        tracing::error!("Failed to parse JWKS response: {}", e);
        ApiError::InternalError(format!("Failed to parse JWKS response: {}", e))
    })?;

    tracing::debug!("JWKS parsed successfully");
    Ok(jwks)
}

/// JWKからDecodingKeyを構築
fn build_decoding_key(jwk: &Jwk) -> Result<DecodingKey, ApiError> {
    if jwk.key_type != "RSA" {
        return Err(ApiError::InternalError(
            "Unsupported key type. Only RSA is supported.".to_string(),
        ));
    }

    let n = jwk.n.as_ref().ok_or_else(|| {
        ApiError::InternalError("JWK missing 'n' parameter".to_string())
    })?;
    let e = jwk.e.as_ref().ok_or_else(|| {
        ApiError::InternalError("JWK missing 'e' parameter".to_string())
    })?;

    // PEM形式の公開鍵を構築
    use rsa::{BigUint, RsaPublicKey};

    // Base64URLデコード
    let n_bytes = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(n)
        .map_err(|e| ApiError::InternalError(format!("Failed to decode 'n': {}", e)))?;
    let e_bytes = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(e)
        .map_err(|e| ApiError::InternalError(format!("Failed to decode 'e': {}", e)))?;

    // BigUintに変換
    let n_big = BigUint::from_bytes_be(&n_bytes);
    let e_big = BigUint::from_bytes_be(&e_bytes);

    // RSA公開鍵を作成
    let public_key = RsaPublicKey::new(n_big, e_big)
        .map_err(|e| ApiError::InternalError(format!("Failed to create RSA public key: {}", e)))?;

    // PEM形式に変換（PKCS#1形式のRSA PUBLIC KEY）
    use rsa::pkcs1::LineEnding;
    let pem_string = public_key
        .to_pkcs1_pem(LineEnding::LF)
        .map_err(|e| ApiError::InternalError(format!("Failed to convert to PEM: {}", e)))?;

    // DecodingKeyを作成
    let decoding_key = DecodingKey::from_rsa_pem(pem_string.as_bytes())
        .map_err(|e| ApiError::InternalError(format!("Failed to create decoding key: {}", e)))?;

    Ok(decoding_key)
}

/// ペイロードからウォレットアドレスを抽出
fn extract_wallet_address(payload: &DynamicJwtPayload) -> Result<String, ApiError> {
    if let Some(ref credentials) = payload.verified_credentials {
        tracing::debug!("Found {} verified credentials", credentials.len());
        if let Some(first_credential) = credentials.first() {
            if let Some(ref address) = first_credential.address {
                tracing::debug!("Extracted wallet address from verified_credentials: {}", address);
                return Ok(address.clone());
            }
            tracing::warn!("First verified credential does not have address field");
        }
    } else {
        tracing::warn!("Payload does not contain verified_credentials field");
    }

    tracing::error!("Failed to extract wallet_address from JWT payload");
    Err(ApiError::Unauthorized {
        code: Some("INVALID_TOKEN".to_string()),
    })
}

