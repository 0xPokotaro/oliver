import { ApiError, UserNotFoundError } from "./error-types";

/**
 * レスポンスからエラーメッセージをパースする
 * JSON/テキスト両方に対応し、クローンして安全に読み取る
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  const clonedResponse = response.clone();
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      try {
        const data = await response.json();
        return data?.error || `Request failed with status ${response.status}`;
      } catch (e) {
        // JSONパース失敗時はテキストとして読み取る
        const text = await clonedResponse.text().catch(() => "");
        return text || `Request failed with status ${response.status}`;
      }
    } else {
      const text = await clonedResponse.text().catch(() => "");
      return text || `Request failed with status ${response.status}`;
    }
  } catch (e) {
    return `Failed to parse error response: ${response.status}`;
  }
}

/**
 * APIエラーレスポンスを適切なエラークラスに変換して throw
 * 401 + "User not found" の場合は UserNotFoundError をスロー
 */
export async function handleApiError(response: Response): Promise<never> {
  const errorMessage = await parseErrorResponse(response);

  // 401エラーで "User not found" を含む場合
  if (
    response.status === 401 &&
    errorMessage.toLowerCase().includes("user not found")
  ) {
    throw new UserNotFoundError(errorMessage);
  }

  // その他のAPIエラー
  throw new ApiError(errorMessage, response.status);
}
