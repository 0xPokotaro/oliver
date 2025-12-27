---
id: auth-architecture
title: 認証基盤アーキテクチャ (Dynamic連携)
sidebar_label: 認証基盤設計
---

# 認証基盤アーキテクチャ設計

本プロジェクトでは、Web3認証プロバイダーとして **Dynamic (dynamic.xyz)** を採用し、自社バックエンド（Rust）と連携した認証基盤を構築する。

## 1. 概要と基本方針

認証における責任分界点は以下の通りとする。**Dynamicを IdP (Identity Provider)** とし、自社バックエンドは **リソースサーバー** として振る舞う構成を採用する。

*   **認証 (Authentication): Dynamic**
    *   ウォレット接続管理 (MetaMask 等)
    *   署名検証 (SIWE: Sign-In with Ethereum)
    *   JWTの発行と管理
    *   マルチウォレット/メールアドレスの紐付け管理
*   **認可 (Authorization) & ユーザー管理: 自社バックエンド (Rust)**
    *   Dynamic発行のJWT検証
    *   自社サービス独自のセッション管理
    *   ユーザープロファイルとアプリデータの管理

:::info 設計のポイント
自社DBのユーザー特定には、ウォレットアドレスではなく **Dynamic User ID** を主キー（外部キー）として使用する。これにより、将来的なマルチチェーン対応やメールログイン導入時のDB改修コストを最小化する。
:::

## 2. アーキテクチャ図

フロントエンド、Dynamic、バックエンドの連携フローを示す。

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant FE as フロントエンド (Next.js)
    participant Dynamic as Dynamic Cloud
    participant API as バックエンド API (Rust)
    participant DB as 自社データベース

    Note over User, Dynamic: 1. 認証フェーズ
    User->>FE: 「ウォレット接続」ボタン押下
    FE->>Dynamic: 接続リクエスト (Dynamic Widget)
    Dynamic->>User: 署名リクエスト (SIWE)
    User->>Dynamic: 署名 (Metamask等)
    Dynamic->>Dynamic: 署名検証 & ユーザー特定
    Dynamic-->>FE: JWT (Auth Token) 返却

    Note over FE, DB: 2. ログイン/登録フェーズ
    FE->>API: POST /api/auth/login (Header: Bearer JWT)
    API->>Dynamic: JWKS取得 (公開鍵)
    API->>API: JWTの署名検証 & sub (UserID) 抽出
    API->>DB: ユーザー検索 (by Dynamic User ID)
    
    alt ユーザーが存在しない場合 (新規)
        API->>DB: 新規ユーザーレコード作成
    else ユーザーが存在する場合
        API->>DB: 最終ログイン日時更新
    end

    API-->>FE: 自社セッションCookie / トークン発行

    Note over Dynamic, DB: 3. データ同期 (非同期/確実性)
    Dynamic->>API: Webhook (user.created / user.updated)
    API->>DB: ユーザー情報/ウォレット情報の整合性確保
3. 認証・登録フロー詳細
3.1 クライアントサイド認証

フロントエンドは DynamicWidget を使用し、ユーザーに署名を要求する。
署名完了後、onAuthSuccess イベントフックにて JWT (authToken) を取得し、即座にバックエンドのログインAPIへ送信する。

3.2 サーバーサイド検証 (Rust API)

バックエンドは、フロントエンドを信頼せず、以下の手順で厳格な検証を行う。

JWKSの取得: Dynamicのエンドポイントから公開鍵セットを取得（キャッシュ利用推奨）。

JWT署名検証: 取得した公開鍵を用いて、送られてきたトークンの正当性を検証。

クレーム確認:

有効期限 (exp) の確認。

sub クレームから Dynamic User ID を取得。

MFAチェック: scopes に requiresAdditionalAuth が含まれていないか確認。

3.3 ユーザープロビジョニング (Just-in-Time)

検証に成功した場合、DBへの問い合わせを行う。

既存ユーザー: ログイン処理へ進む。

新規ユーザー: JWTに含まれる情報（Dynamic User ID, Wallet Address）を用いて、即座にDBへレコードを作成する。

4. データモデル設計

自社DBの users テーブルは、DynamicのIDを正として紐付けを行う。

Users テーブル構造案
カラム名	データ型	説明	備考
id	UUID	自社システム内部の主キー	他テーブルからのリレーション用
dynamic_user_id	String / UUID	DynamicのUser ID	ユニーク制約 / 検索キー
primary_wallet_address	String	表示用ウォレットアドレス	小文字化して保存推奨
nickname	String	アプリ内表示名	ユーザー編集可能
created_at	Timestamp	作成日時	

:::tip
primary_wallet_address はあくまで検索や表示の便宜上のために保持する。認証の照合は必ず dynamic_user_id で行うこと。
:::

5. API インターフェース仕様 (認証関連)

バックエンドで実装すべき最小限のエンドポイント定義。

POST /api/auth/login

目的: ログインおよび新規登録（Upsert動作）。

リクエスト: Bodyに { authToken: string } を含む。

レスポンス: 成功時 200 OK とともにセッションCookie (HttpOnly) をSet-Cookieする。

処理概要: 前述のJWT検証を行い、DBと同期してセッションを発行する。

POST /api/auth/logout

目的: ログアウト処理。

処理概要: セッションCookieを破棄（無効化）する。

GET /api/users/me

目的: ログイン中のユーザー自身のプロフィール取得。

要件: 有効なセッションCookieが必要。

レスポンス: ユーザーID、ニックネーム、アイコン、保有ポイント等。

POST /api/webhooks/dynamic

目的: Dynamic側でのイベント（ユーザー作成、更新）をDBに反映する。

セキュリティ: Webhook Secretを用いた署名検証を必ず行うこと。

主なイベント: user.created, user.updated

役割: フロントエンド経由の処理が失敗した場合のフェイルセーフ、およびメタデータ更新の追従。

6. セキュリティ考慮事項

秘密鍵の管理: JWT検証に必要な情報は公開鍵だが、Webhook検証用のSecretや、自社セッション発行用の鍵は環境変数等で厳重に管理する。

HTTPS必須: すべての通信はHTTPS上で行う。

フロントエンドの役割: フロントエンドでのJWT検証は「表示制御用」であり、セキュリティ機能ではないと認識する。重要なデータアクセス制御は必ずバックエンドで行う。
