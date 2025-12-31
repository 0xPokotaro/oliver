/**
 * AIエージェント「Oliver」の共通JSON型定義
 * 人格層と能力層が共有する入出力プロトコル
 */

/**
 * エージェントのコンテキスト情報
 */
export interface AgentContext {
  session_id: string
  status: 'INPUT_RECEIVED' | 'RESULT_RECEIVED'
}

/**
 * エージェントのアクション種別
 */
export type AgentAction = 'TALK' | 'EXECUTE'

/**
 * 呼び出し可能な能力（ツール）名
 */
export type AgentTool = 'none' | 'x402_payment'

/**
 * エージェントのレスポンス
 * 人格層が返すJSON形式
 */
export interface AgentResponse {
  context: AgentContext
  thought: string
  action: AgentAction
  tool: AgentTool
  params: Record<string, unknown>
  message: string
}
