import { Hono } from 'hono'
import { getMerchantApiUrl, proxyRequest, proxyRequestWithBody } from './utils'

const products = new Hono()

// 商品一覧取得
products.get('/', async (c) => {
  const merchantApiUrl = getMerchantApiUrl();
  const category = c.req.query('category');
  const url = new URL(`${merchantApiUrl}/api/v1/products`);
  if (category) {
    url.searchParams.set('category', category);
  }
  
  return proxyRequest(url.toString(), c, 'Merchant API getProducts failed');
})

// 商品詳細取得
products.get('/:sku', async (c) => {
  const merchantApiUrl = getMerchantApiUrl();
  const sku = c.req.param('sku');
  const url = `${merchantApiUrl}/api/v1/products/${encodeURIComponent(sku)}`;
  
  return proxyRequest(url, c, 'Merchant API getProductBySku failed');
})

// 商品購入
products.post('/:sku/buy', async (c) => {
  const merchantApiUrl = getMerchantApiUrl();
  const sku = c.req.param('sku');
  const body = await c.req.json();
  const { quantity } = body;
  
  const url = `${merchantApiUrl}/api/v1/products/${encodeURIComponent(sku)}/buy`;
  
  return proxyRequestWithBody(
    url,
    'POST',
    { quantity },
    c,
    'Merchant API buyProduct failed'
  );
})

export default products

