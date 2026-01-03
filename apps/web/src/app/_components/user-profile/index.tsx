"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs";

export const UserProfileContainer = () => {
  return (
    <div className="p-8 space-y-4">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">ユーザー情報</TabsTrigger>
          <TabsTrigger value="password">エージェント情報</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default UserProfileContainer;
