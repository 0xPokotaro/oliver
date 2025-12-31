import OpenAI from 'openai'
import type { AgentResponse } from '@oliver/api/features/users/types/agent'
import { OLIVER_SYSTEM_PROMPT } from '@oliver/api/features/users/prompts/oliver'

/**
 * OpenAIクライアントの初期化
 */
function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  return new OpenAI({
    apiKey: apiKey,
  })
}

/**
 * 人格層：ユーザー入力を受け取り、次の行動を決定したJSONを返す
 * @param input - ユーザー入力または前回のエージェント状態
 * @returns エージェントの判断結果（JSON形式）
 */
export async function askPersonality(
  input: AgentResponse | { user_input: string; session_id: string }
): Promise<AgentResponse> {
  const openai = createOpenAIClient()

  // 入力がAgentResponseの場合は、実行結果を受け取った状態
  // そうでない場合は、ユーザー入力を受け取った状態
  const isResultReceived = 'action' in input

  let userMessage: string
  if (isResultReceived) {
    // 実行結果を受け取った場合
    const result = input as AgentResponse
    userMessage = `実行結果を受け取りました。以下の情報を元に、ユーザーへの最終的な返答を生成してください。

実行結果:
${JSON.stringify(result.params, null, 2)}

前回の思考: ${result.thought}
前回のメッセージ: ${result.message}`
  } else {
    // ユーザー入力を受け取った場合
    const userInput = input as { user_input: string; session_id: string }
    userMessage = `ユーザーが以下のように言いました：

「${userInput.user_input}」

この入力に対して、適切な判断を行い、JSON形式で応答してください。`
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: OLIVER_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(content) as AgentResponse

    // 型チェックとバリデーション
    if (!parsed.context || !parsed.action || !parsed.tool || !parsed.message) {
      throw new Error('Invalid response format from OpenAI')
    }

    // ステータスを適切に設定
    if (!isResultReceived) {
      parsed.context.status = 'INPUT_RECEIVED'
    } else {
      parsed.context.status = 'RESULT_RECEIVED'
    }

    // session_idを設定
    if (isResultReceived) {
      parsed.context.session_id = (input as AgentResponse).context.session_id
    } else {
      parsed.context.session_id = (input as { user_input: string; session_id: string }).session_id
    }

    return parsed
  } catch (error) {
    console.error('Personality layer error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get personality response: ${error.message}`)
    }
    throw new Error('Failed to get personality response: Unknown error')
  }
}

