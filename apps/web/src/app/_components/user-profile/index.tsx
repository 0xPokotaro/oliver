'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useUserProfile } from '@/hooks/auth';
import { Card } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/components/animate/tabs';
import { UserInfoTab } from './user-info-tab';
import { AgentInfoTab } from './agent-info-tab';

export const UserProfileContainer = () => {
  const { authenticated, ready } = usePrivy();
  const { data, isLoading, error } = useUserProfile();

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-destructive">Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div className="p-8 space-y-4">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">ユーザー情報</TabsTrigger>
          <TabsTrigger value="password">エージェント情報</TabsTrigger>
        </TabsList>

        <Card className="shadow-none py-0">
          <TabsContents className="py-6">
            <TabsContent value="account" className="flex flex-col gap-6">
              <UserInfoTab user={data} />
            </TabsContent>
            <TabsContent value="password" className="flex flex-col gap-6">
              <AgentInfoTab smartAccountAddress={data.smartAccountAddress} />
            </TabsContent>
          </TabsContents>
        </Card>
      </Tabs>
    </div>
  );
};

export default UserProfileContainer;
