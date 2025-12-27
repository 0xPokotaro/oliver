# API設計書作成ガイドライン

AI AgentおよびJohnnyがAPI仕様書を作成する際の標準フォーマットです。

## 必須セクション

各API設計書には以下を含めてください：

1. **Frontmatter**: `id`, `title`, `sidebar_label`
2. **タイトルと概要**: APIの機能を1-2文で説明
3. **エンドポイント**: HTTPメソッドとパス
4. **処理フロー**: 複雑な処理がある場合はMermaidシーケンス図
5. **リクエスト**: ヘッダー、クエリパラメータ、リクエストボディ（表形式 + JSON例）
6. **レスポンス**: 各HTTPステータスコード（200, 400, 401など）とJSON例
7. **データモデル**: TypeScriptインターフェース（日本語コメント付き）

## オプションセクション

必要に応じて追加：

- **実装の詳細**: 処理ステップの説明
- **セキュリティ考慮事項**: 冪等性、認証方法など
- **フロントエンド実装例**: TypeScriptコード例

## スタイルガイド

- **ファイル名**: `{番号}-{機能名}.md`（例: `01-user-login.md`）
- **HTTPメソッド**: 大文字（`GET`, `POST`）
- **JSONキー**: camelCase（`userId`, `walletAddress`）
- **必須/任意**: 明確に表記し、デフォルト値も記載

## 共通リファレンス

エラーコードや共通型は `00-common-reference.md` へリンク：

```markdown
エラーレスポンスの共通形式については、[共通リファレンス](../00-common-reference.md#エラーハンドリング)を参照してください。
```

## チェックリスト

- [ ] Frontmatter設定済み
- [ ] エンドポイント記載済み
- [ ] リクエスト/レスポンス記載済み
- [ ] データモデル定義済み
- [ ] コード例が動作する形式
- [ ] ファイル名が命名規則に準拠

## 参考例

- `apps/docs/docs/99-api-reference/user-api/01-user-login.md`
- `apps/docs/docs/99-api-reference/user-api/02-user-logout.md`
- `apps/docs/docs/99-api-reference/user-api/03-user-profile.md`
