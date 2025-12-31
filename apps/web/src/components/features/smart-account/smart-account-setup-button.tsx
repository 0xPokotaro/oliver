'use client';

import { Button } from '@/components/ui/button';
import { useSmartAccountSetup } from '@/hooks/smart-account';

interface SmartAccountSetupButtonProps {
  isConfigured: boolean;
  onSetupComplete?: () => void;
}

/**
 * Smart Account 設定ボタンコンポーネント
 * 設定済みの場合は無効化される
 */
export const SmartAccountSetupButton = ({
  isConfigured,
  onSetupComplete
}: SmartAccountSetupButtonProps) => {
  const { setupSmartAccount, isLoading } = useSmartAccountSetup();

  const handleSetup = async () => {
    try {
      await setupSmartAccount();
      onSetupComplete?.();
    } catch (error) {
      console.error('Setup failed:', error);
    }
  };

  return (
    <Button
      onClick={handleSetup}
      disabled={isLoading || isConfigured}
    >
      {isConfigured ? '設定済み' : isLoading ? '設定中...' : 'エージェントを設定'}
    </Button>
  );
};
