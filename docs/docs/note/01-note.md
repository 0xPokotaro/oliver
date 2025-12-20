# Project Syntropy: The Autonomous Commerce Protocol

> Restoring Economic Equilibrium via x402 & 2-Layer Agent Architecture

これまでの議論（定義の刷新、2レイヤー構成、x402プロトコル、最新EIP標準）を全て統合し、プロジェクト概要を再定義しました。

このドキュメントは、 **「AIによる経済活動の自律化」** を目的とした次世代プロトコルの基本設計書となります。

## 1. Vision & Mission（ビジョンとミッション）

> 「人間を、判断と決済の『認知コスト』から解放する」

Syntropy（シントロピー）は、AIエージェントが人間の代わりに「推論」し、Web上のあらゆるサービスと「決済」を行うための、UIを持たない（Headless）商取引インフラです。<br />
私たちは、インターネットの失われた標準である HTTP 402 (Payment Required) と、2層構造のAIアーキテクチャを組み合わせることで、摩擦係数ゼロの経済圏を構築します。

## 2. Core Definitions（根底にある定義）

本プロジェクトは、以下の再定義に基づき設計されています。

### 2.1 The Definition of Payment（支払いの定義）

支払いとは、資金の移動ではありません。<br />
それは、価値の移動によって生じた「非対称性（負債）」を解消し、関係性を「均衡（Equilibrium）」に戻すための合意形成プロセスです。
Syntropyは、このプロセスを人間による手動操作（クリック、入力）から、AIによる自律的な署名へと委譲します。

### 2.2 The Definition of AI（AIの定義）

AIとは、チャットボットではありません。
それは、人間の脳から**「推論（Inference）」と「判断（Judgment）」を切り出し、外部化したツール**です。
本システムにおいて、AIは単に会話するだけでなく、ウォレットへの署名権限を持ち、経済的な結果を確定させる主体として機能します。

## 3. System Architecture: 2-Layer Agent Model（2層構造）

拡張性とセキュリティを両立するため、AIの責務を「対話（人格）」と「執行（能力）」に分離します。

### Layer 1: The Orchestrator (Interface & Context)

「ユーザーの意図（Intent）を理解し、指揮する脳」

- **役割**: 音声I/O、文脈理解、タスクのルーティング。
- **機能**: ユーザーの「猫の餌がない」という曖昧な言葉を解析し、適切なLayer 2モジュールへ指示（Intent JSON）を出します。
- **永続性**: ユーザーの人格や好みを記憶し続ける「コンシェルジュ」です。

### Layer 2: The Specialist Modules (Execution & Protocol)

「プロトコルを実行し、決済を完結させる筋肉」

- **役割**: 特定ドメイン（購買、介護、エネルギー等）のロジック実行、API通信、署名生成。
- **機能**: 今回のPoCでは "Commerce Module" を実装します。これはx402プロトコルを解釈し、EIP-712署名を生成してFacilitatorへ送信する「購買の専門家」です。
- **拡張性**: 将来、「Healthcare Module」などをプラグインすることで、L1（人格）を変えずに能力を拡張できます。

## 4. Communication Protocol: x402 "Gatekeeper"（通信プロトコル）

既存のWeb APIに「決済ゲート」を設置するモデルを採用し、UI開発を不要にします。

1. **Request**: L2 ModuleがAPIへアクセス。
2. **Challenge (402)**: Serverが 402 Payment Required を返し、価格と条件を提示。
3. **Judgment**: L2 Moduleがポリシー（過去履歴±10%以内など）を検証。
4. **Sign (Gasless)**: EIP-2612 (Permit) と EIP-712 (Intent) を用いて、ガスレスで署名。
5. **Settlement**: Facilitatorが署名を検証し、オンチェーン決済を実行。

## 5. Technology Stack & Standards（技術スタックと標準）

PoCから将来の社会実装（Production）までを見据えた技術選定です。

### Standards

- **Payment Standard**: HTTP 402 + EIP-712 / EIP-2612 (Gasless Flow)
- **Account Abstraction**: ERC-4337 (Smart Accounts) for Agent Identity
- **Authorization**: ERC-7579 (Modular Accounts) & ERC-7715 (Session Keys)

### Infrastructure

- **L1/L2 AI**: Next.js + OpenAI API
- **Database**: Supabase (Log & Context)
- **Chain**: Ethereum L2 (Base / Optimism / Polygon)

## 6. Use Cases（ユースケース）

本プロトコルは「猫の餌」にとどまらず、以下の領域へ水平展開されます。

### Case A: Autonomous Replenishment（物理資産の自律補充）

- **概要**: 消費材の残量を予測し、欠乏する前に補充する。
- **適用**: ペットフード、日用品、産業用部品の在庫管理。

### Case B: On-Demand Workforce（労働力の即時調達）

- **概要**: 必要な瞬間に、必要なスキルの人間をスポットで雇用する。
- **適用**: 介護スタッフの急な手配、配送ギグワーカーのマッチング。

### Case C: Digital Resource Allocation（デジタル資源の最適化）

- **概要**: 計算リソースやAPIアクセス権をマイクロペイメントで調達する。
- **適用**: AI学習用GPUの借用、有料データセットの1回利用。

## 7. Value Proposition（提供価値）

### For Users

「買う・探す・払う」という行為の消滅。生活の維持管理コスト（メンテナンスコスト）がゼロになる。

### For Merchants

ECサイト（フロントエンド）の開発・運用費が不要になる。APIを公開するだけで、世界中のAIを顧客にできる。

### For Society

需要と供給がリアルタイムで結合し、廃棄ロスや機会損失のない「均衡のとれた経済」が実現する。

---
