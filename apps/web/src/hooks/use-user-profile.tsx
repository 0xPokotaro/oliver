import { useQuery } from '@tanstack/react-query'
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { client } from "@/lib/hono";

export const useUserProfile = () => {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    retry: false, // 自動リトライを無効化（手動でログイン処理を実行するため）
    queryFn: async () => {
      try {
        const authToken = await getAccessToken();
        if (!authToken) {
          throw new Error("No authentication token available");
        }

        const response = await client.api.users.profile.$get({
          header: {
            Authorization: `Bearer ${authToken}`
          }
        })

        const responseStatus = response.status
        const responseOk = response.ok

        // ステータスコードを最初にチェック（response.json()を呼ぶ前に）
        // 401エラー（USER_NOT_FOUND）を検知した場合、自動的にログイン処理を実行
        if (responseStatus === 401) {
          // レスポンスをクローンして、後で再度読み取れるようにする
          const clonedResponse = response.clone()
          
          // エラーレスポンスのパース処理
          let errorData: any = {}
          let contentType = ''
          
          try {
            if (response.headers && typeof response.headers.get === 'function') {
              contentType = response.headers.get('content-type') || ''
            }
            
            if (contentType.includes('application/json')) {
              try {
                errorData = await response.json()
              } catch (e) {
                const text = await clonedResponse.text().catch(() => '')
                errorData = { error: text || `Failed to fetch profile: ${responseStatus}` }
              }
            } else {
              const text = await clonedResponse.text().catch(() => '')
              errorData = { error: text || `Failed to fetch profile: ${responseStatus}` }
            }
          } catch (parseError) {
            errorData = { error: `Failed to parse error response: ${responseStatus}` }
          }

          // 401エラーの場合、エラーデータの内容に関係なく自動ログイン処理を実行
          // （USER_NOT_FOUNDエラーの可能性が高いため）
          // useWalletsフックからウォレットアドレスを取得
          if (!ready || !authenticated) {
            throw new Error("User is not authenticated. Please sign in first.");
          }
          
          const walletAddress = wallets[0]?.address;
          
          if (!walletAddress) {
            throw new Error("Wallet address not found. Please connect a wallet first.");
          }

          // ログインエンドポイントを呼び出す
          const loginResponse = await client.api.auth.login.$post({
            json: {
              authToken,
              walletAddress,
            }
          })

          if (!loginResponse.ok) {
            // ログインエラーのパース処理
            let loginError: any = {}
            const loginContentType = loginResponse.headers?.get?.('content-type') || ''
            
            if (loginContentType.includes('application/json')) {
              try {
                loginError = await loginResponse.json()
              } catch (e) {
                const text = await loginResponse.text().catch(() => '')
                loginError = { error: text || "Failed to login" }
              }
            } else {
              const text = await loginResponse.text().catch(() => '')
              loginError = { error: text || "Failed to login" }
            }

            throw new Error(loginError?.error || "Failed to login");
          }

          // ログイン成功後、プロフィールを再取得
          const profileResponse = await client.api.users.profile.$get({
            header: {
              Authorization: `Bearer ${authToken}`
            }
          })

          if (!profileResponse.ok) {
            throw new Error("Failed to fetch profile after login");
          }

          return profileResponse.json()
        }

        // 正常なレスポンスの場合（200 OK）
        if (responseOk && responseStatus === 200) {
          return response.json()
        }

        // その他のエラーの場合（401以外、または!response.okの場合）
        if (!responseOk) {
          // エラーレスポンスのパース処理
          const clonedResponse = response.clone()
          let errorData: any = {}
          let contentType = ''
          
          try {
            if (response.headers) {
              if (typeof response.headers.get === 'function') {
                contentType = response.headers.get('content-type') || ''
              }
            }
            
            if (contentType.includes('application/json')) {
              try {
                errorData = await response.json()
              } catch (e) {
                const text = await clonedResponse.text().catch(() => '')
                errorData = { error: text || `Failed to fetch profile: ${responseStatus}` }
              }
            } else {
              const text = await clonedResponse.text().catch(() => '')
              errorData = { error: text || `Failed to fetch profile: ${responseStatus}` }
            }
          } catch (parseError) {
            errorData = { error: `Failed to parse error response: ${responseStatus}` }
          }

          throw new Error(errorData?.error || `Failed to fetch profile: ${responseStatus}`)
        }

        // 予期しないステータスコードの場合
        // レスポンスボディを読み取ってエラーメッセージを取得
        let errorMessage = `Unexpected response status: ${responseStatus}`
        try {
          const clonedResponse = response.clone()
          const text = await clonedResponse.text()
          if (text) {
            try {
              const json = JSON.parse(text)
              errorMessage = json.error || errorMessage
            } catch {
              errorMessage = text.substring(0, 200) || errorMessage
            }
          }
        } catch (e) {
          // エラーレスポンスの読み取りに失敗した場合はデフォルトメッセージを使用
        }
        throw new Error(errorMessage)
      } catch (error: any) {
        // Honoクライアントが例外を投げた場合の処理
        
        // エラーがResponseオブジェクトを含む場合
        if (error?.response) {
          const errorResponse = error.response
          if (errorResponse.status === 401) {
            let errorData: any = {}
            try {
              errorData = await errorResponse.json()
            } catch (e) {
              // JSONパース失敗
              errorData = { error: await errorResponse.text().catch(() => 'Unknown error') }
            }

            if (errorData?.code === 'USER_NOT_FOUND' || errorData?.error?.includes('User not found')) {
              // 自動ログイン処理（上記と同じ）
              if (!ready || !authenticated) {
                throw new Error("User is not authenticated. Please sign in first.");
              }
              
              const walletAddress = wallets[0]?.address;
              
              if (!walletAddress) {
                throw new Error("Wallet address not found. Please connect a wallet first.");
              }

              const loginResponse = await client.api.auth.login.$post({
                json: {
                  authToken: await getAccessToken(),
                  walletAddress,
                }
              })

              if (!loginResponse.ok) {
                throw new Error("Failed to login");
              }

              const profileResponse = await client.api.users.profile.$get({
                header: {
                  Authorization: `Bearer ${await getAccessToken()}`
                }
              })

              if (!profileResponse.ok) {
                throw new Error("Failed to fetch profile after login");
              }

              return profileResponse.json()
            }
          }
        }
        
        throw error
      }
    }
  })
  return { data, isLoading, error }
}
