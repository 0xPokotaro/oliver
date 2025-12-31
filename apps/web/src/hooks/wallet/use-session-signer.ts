'use client';

import { useEffect, useState } from 'react';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import { getSessionSignerPrivateKey } from '@/lib/config/smart-account';

export const useSessionSigner = () => {
  const [smartAccount, setSmartAccount] = useState<PrivateKeyAccount | null>(null);

  useEffect(() => {
    try {
      const privateKey = getSessionSignerPrivateKey();
      const sessionSigner = privateKeyToAccount(privateKey);
      setSmartAccount(sessionSigner);
    } catch (error) {
      console.error('Failed to initialize session signer:', error);
      setSmartAccount(null);
    }
  }, []);

  return smartAccount;
};
