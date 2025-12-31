'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { TOKEN_ADDRESSES } from '@/lib/config/constants';

/**
 * Smart Account の設定情報を表示するコンポーネント
 * ガス代支払いと権限範囲の情報を表示
 */
export const SmartAccountConfigDisplay = () => {
  return (
    <dl className="space-y-4">
      <div className="border-b border-border pb-4">
        <dt className="text-sm font-medium text-muted-foreground mt-4 mb-1">ガス代支払い</dt>
        <dd className="text-base space-y-1">
          <div className="font-mono">・支払いチェーン: Avalanche</div>
          <div className="font-mono break-all">・支払いトークン: USDC ({TOKEN_ADDRESSES.USDC})</div>
        </dd>
        <Alert className="mt-4 bg-gray-50 border-gray-200 text-blue-800">
          <InfoIcon color="gray" />
          <AlertDescription>
            現在はUSDCを使用していますが、将来的にJPYCを想定しています。
          </AlertDescription>
        </Alert>
      </div>
      <div className="pb-2">
        <dt className="text-sm font-medium text-muted-foreground mb-1">権限範囲</dt>
        <dd className="text-base space-y-1">
          <div className="font-mono">・対象チェーン: Avalanche</div>
          <div className="font-mono break-all">・対象トークン: JPYC MOCK ({TOKEN_ADDRESSES.MOCK_ERC20})</div>
          <div className="font-mono">・最大購入金額: 2500 JPYC</div>
        </dd>
        <Alert className="mt-4 bg-gray-50 border-gray-200 text-blue-800">
          <InfoIcon color="gray" />
          <AlertDescription>
            現在はMOCK_ERC20を使用していますが、将来的にJPYCを想定しています。
          </AlertDescription>
        </Alert>
      </div>
    </dl>
  );
};
