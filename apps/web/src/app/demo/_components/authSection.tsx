'use client'

import { useEffect } from 'react'
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useWalletOptions } from "@dynamic-labs/sdk-react-core";
import { Button } from '@/components/ui/button'

const walletKey = "metamask";

const AuthSection = () => {
  const { selectWalletOption } = useWalletOptions();
  const {user,  handleLogOut } = useDynamicContext();

  const connectWithWallet = async (walletKey: string) => {
    return await selectWalletOption(walletKey)
  }

  useEffect(() => {
    console.log('user: ', user)
  }, [user])

  return (
    <div>
      <h1>Auth Section</h1>
      <div className="flex gap-2">
        <Button onClick={() => connectWithWallet(walletKey)}>Login</Button>
        <Button onClick={() => handleLogOut()}>Logout</Button>
      </div>
    </div>
  )
}

export default AuthSection
