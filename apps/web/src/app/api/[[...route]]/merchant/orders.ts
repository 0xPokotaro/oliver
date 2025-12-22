import { Hono } from 'hono'
import { getMerchantApiUrl, proxyRequest } from './utils'

const orders = new Hono()

// 注文情報取得
orders.get('/:orderId', async (c) => {
  const merchantApiUrl = getMerchantApiUrl();
  const orderId = c.req.param('orderId');
  const url = `${merchantApiUrl}/api/v1/orders/${encodeURIComponent(orderId)}`;
  
  return proxyRequest(url, c, 'Merchant API getOrderById failed');
})

export default orders

