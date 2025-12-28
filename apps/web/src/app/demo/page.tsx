'use client'

import { useEffect, useState } from 'react'
import { client } from '@/lib/hono'
import AuthSection from './_components/authSection'

const DemoPage = () => {
  const [data, setData] = useState<{ message: string } | null>(null)

  useEffect(() => {
    (async () => {
      const response = await client.api.users.list.$get({})
      const json = await response.json()
      setData(json)
    })()
  }, [])

  return (
    <div>
      <h1>Demo Page</h1>
      {data && <p>{data.message}</p>}
      <AuthSection />
    </div>
  );
};

export default DemoPage;
