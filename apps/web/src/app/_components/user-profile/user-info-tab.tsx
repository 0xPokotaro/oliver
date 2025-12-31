'use client';

import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface UserInfoTabProps {
  user: {
    id: string;
    privyUserId: string;
    walletAddress: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * ユーザー情報タブコンポーネント
 * ユーザーの基本情報を表示
 */
export const UserInfoTab = ({ user }: UserInfoTabProps) => {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">ユーザー情報</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div className="border-b border-border pb-4">
            <dt className="text-sm font-medium text-muted-foreground mb-1">ID</dt>
            <dd className="text-base font-mono break-all">{user.id}</dd>
          </div>
          <div className="border-b border-border pb-4">
            <dt className="text-sm font-medium text-muted-foreground mb-1">Privy User ID</dt>
            <dd className="text-base font-mono break-all">{user.privyUserId}</dd>
          </div>
          <div className="border-b border-border pb-4">
            <dt className="text-sm font-medium text-muted-foreground mb-1">Wallet Address</dt>
            <dd className="text-base font-mono break-all">{user.walletAddress}</dd>
          </div>
          <div className="border-b border-border pb-4">
            <dt className="text-sm font-medium text-muted-foreground mb-1">Created At</dt>
            <dd className="text-base">{new Date(user.createdAt).toLocaleString()}</dd>
          </div>
          <div className="pb-2">
            <dt className="text-sm font-medium text-muted-foreground mb-1">Updated At</dt>
            <dd className="text-base">{new Date(user.updatedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </CardContent>
    </>
  );
};
