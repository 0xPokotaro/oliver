import { Hono } from 'hono'
import { getMerchantApiUrl, proxyRequest } from './utils'

const health = new Hono()

// ヘルスチェック
health.get('/health', async (c) => {
  const merchantApiUrl = getMerchantApiUrl();
  const url = `${merchantApiUrl}/api/v1/health`;
  return proxyRequest(url, c, 'Merchant API health check failed');
})

export default health

