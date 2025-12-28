---
description: "Project-wide basic standards and communication"
alwaysApply: true
---
# Global Project Rules

- 言語: 常に日本語で回答してください。
- ツール: パッケージ管理には `pnpm` を使用してください。
- 修正方針: 既存のコードスタイルを厳守し、破壊的な変更を行う前には必ず確認を求めてください。
- モノレポ構造: ルートの `Cargo.toml` や `package.json` を不用意に書き換えないでください。

## Commit Message Rules

When generating commit messages, strictly follow these rules:

### Format
`<emoji> <subject>`

- emoji: Select appropriate emoji from [gitmoji.dev](https://gitmoji.dev/)
- subject: Brief description of changes (in English)
- **CRITICAL - Character limit**: The entire commit message (emoji + space + subject) MUST be exactly 50 characters or less. NEVER exceed 50 characters. This is a hard limit, not a suggestion.

### Common gitmoji

- ✨ `:sparkles:` - Introduce new features
- 🐛 `:bug:` - Fix a bug
- 📝 `:memo:` - Add or update documentation
- ♻️ `:recycle:` - Refactor code
- 🔧 `:wrench:` - Add or update configuration files
- 🚀 `:rocket:` - Deploy stuff
- ⚡️ `:zap:` - Improve performance
- 🔥 `:fire:` - Remove code or files
- 🎨 `:art:` - Improve structure / format of the code
- ✅ `:white_check_mark:` - Add, update, or pass tests
- 🚨 `:rotating_light:` - Fix compiler / linter warnings
- 🏗️ `:building_construction:` - Make architectural changes
- 📦 `:package:` - Add or update compiled files or packages
- 🚚 `:truck:` - Move or rename resources
- 🙈 `:see_no_evil:` - Add or update .gitignore file
- ➕ `:heavy_plus_sign:` - Add a dependency
- ➖ `:heavy_minus_sign:` - Remove a dependency
- ⬆️ `:arrow_up:` - Upgrade dependencies
- ⬇️ `:arrow_down:` - Downgrade dependencies

### Examples

- `✨ Add MockERC20 deployment module`
- `🐛 Fix account address retrieval method`
- `📝 Add setup instructions to README`
- `♻️ Refactor Dockerfile for pnpm`
- `🔧 Add local network to hardhat.config.ts`
- `🚀 Deploy contracts to local network`
- `⚡️ Improve build performance`
- `🔥 Remove unused dependencies`

### Notes

- Use a single space between emoji and subject
- Start subject with a verb (imperative mood)
- Write in English only
- Keep it simple - no body text needed
- **CRITICAL - Strict 50 character limit**: The entire message (emoji + space + subject) MUST NOT exceed 50 characters. This is a hard limit. Do not use 150 characters or any other limit - ONLY 50 characters maximum.
