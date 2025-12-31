'use client';

import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SmartAccountSetupButton } from '@/components/features/smart-account/smart-account-setup-button';
import { SmartAccountConfigDisplay } from '@/components/features/smart-account/smart-account-config-display';
import { useSmartAccountStatus } from '@/hooks/smart-account';
import { useSessionSigner } from '@/hooks/wallet';

interface AgentInfoTabProps {
  smartAccountAddress?: string | null;
}

/**
 * エージェント情報タブコンポーネント
 * Smart Account の設定状態と設定情報を表示
 */
export const AgentInfoTab = ({ smartAccountAddress }: AgentInfoTabProps) => {
  const { isConfigured, isChecking } = useSmartAccountStatus();
  const sessionSigner = useSessionSigner();

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-between">
          <span>エージェント情報</span>
          <SmartAccountSetupButton isConfigured={isConfigured} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div className="border-b border-border pb-4">
            <dt className="text-sm font-medium text-muted-foreground mb-1">
              Smart Account Address
            </dt>
            <dd className="text-base font-mono break-all">
              {isChecking ? '確認中...' : (smartAccountAddress || sessionSigner?.address || '未設定')}
            </dd>
          </div>
        </dl>
        <SmartAccountConfigDisplay />
      </CardContent>
    </>
  );
};
