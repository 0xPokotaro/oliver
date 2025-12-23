# Transaction Flow: Request -> 402 Challenge -> Sign -> Execute の流れ

## トランザクションフロー

1. **Request**: L2 ModuleがAPIへアクセス。
2. **Challenge (402)**: Serverが 402 Payment Required を返し、価格と条件を提示。
3. **Judgment**: L2 Moduleがポリシー（過去履歴±10%以内など）を検証。
4. **Sign (Gasless)**: EIP-2612 (Permit) と EIP-712 (Intent) を用いて、ガスレスで署名。
5. **Settlement**: Facilitatorが署名を検証し、オンチェーン決済を実行。

## L1とL2の通信：Intent-Based API

L1からL2へは、人間のような曖昧な言葉ではなく、構造化された**「Intent JSON」**を渡します。

例：

```json
{
  "action": "replenish",
  "target": "pet_food",
  "urgency": "high"
}
```

これにより、L2モジュールはプログラムとして安定して動作できます。

