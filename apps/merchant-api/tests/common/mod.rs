/// テスト用ヘルパー関数

use merchant_api::config::X402Config;
use merchant_api::state::AppState;
use sqlx::PgPool;
use std::sync::Arc;

/// テスト用のAppStateを作成
pub fn create_test_state(pool: PgPool) -> AppState {
    let config = X402Config {
        pay_to: "0x0000000000000000000000000000000000000000".to_string(),
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".to_string(),
        max_amount_required: "0".to_string(),
        network: "localhost".to_string(),
        max_timeout_seconds: 3600,
        facilitator_url: "http://localhost:8403".to_string(),
        description: "Test".to_string(),
        chain_id: 31337,
        shipping_fee: 500,
    };
    AppState {
        x402_config: Arc::new(config),
        db_pool: pool,
    }
}

/// テスト用のデータベースプールを取得
pub async fn get_test_db_pool() -> anyhow::Result<PgPool> {
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost:54322/postgres".to_string());
    
    PgPool::connect(&database_url)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to connect to test database: {}", e))
}

/// テストデータをクリーンアップ
pub async fn cleanup_test_data(pool: &PgPool) -> anyhow::Result<()> {
    // 外部キー制約のため、productsを先に削除
    sqlx::query("DELETE FROM products WHERE id LIKE 'product-%'")
        .execute(pool)
        .await?;
    // payment_historyも削除（orderIdが設定されている可能性があるため）
    sqlx::query("DELETE FROM payment_history WHERE id LIKE 'payment-%'")
        .execute(pool)
        .await?;
    // merchantは削除しない（他のテストが並列実行中かもしれないため）
    // 代わりに、setup_test_dataでON CONFLICTを使って確実に存在させる
    Ok(())
}

/// テストデータを挿入
pub async fn setup_test_data(pool: &PgPool) -> anyhow::Result<()> {
    // まず既存のテストデータをクリーンアップ（productsとpayment_historyのみ）
    cleanup_test_data(pool).await.ok();

    // テスト用のmerchantを作成（確実に存在させるため、ON CONFLICT DO UPDATEも使用）
    // 注意: merchantsテーブルのidはPRIMARY KEYなので、ON CONFLICT (id)が使用可能
    // merchantは削除しないため、ON CONFLICTで確実に存在することを保証
    sqlx::query(
        r#"
        INSERT INTO merchants (id, name, "createdAt", "updatedAt")
        VALUES ('test-merchant-1', 'Test Merchant', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            "updatedAt" = NOW()
        "#,
    )
    .execute(pool)
    .await?;

    // merchantが確実に存在することを確認（念のため）
    let merchant_exists: bool = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM merchants WHERE id = 'test-merchant-1')"
    )
    .fetch_one(pool)
    .await?;

    if !merchant_exists {
        return Err(anyhow::anyhow!("Failed to create test merchant"));
    }

    // テスト用の商品を挿入（IDでのコンフリクトを処理）
    sqlx::query(
        r#"
        INSERT INTO products (id, name, description, price, currency, "stockStatus", "imageUrl", category, attributes, "merchantId", "createdAt", "updatedAt")
        VALUES 
            ('product-1', 'Test Product 1', 'Description 1', 1000000, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'in_stock', 'https://example.com/image1.png', 'cat_food', '{"weight": "2kg", "brand": "Test Brand"}'::jsonb, 'test-merchant-1', NOW(), NOW()),
            ('product-2', 'Test Product 2', 'Description 2', 2000000, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'low_stock', 'https://example.com/image2.png', 'dog_food', NULL, 'test-merchant-1', NOW(), NOW()),
            ('product-3', 'Test Product 3', 'Description 3', 3000000, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'out_of_stock', NULL, 'cat_food', '{"weight": "1kg"}'::jsonb, 'test-merchant-1', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            currency = EXCLUDED.currency,
            "stockStatus" = EXCLUDED."stockStatus",
            "imageUrl" = EXCLUDED."imageUrl",
            category = EXCLUDED.category,
            attributes = EXCLUDED.attributes,
            "updatedAt" = NOW()
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}

