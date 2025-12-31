'use client';

import { useState, useEffect } from 'react';
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/animate-ui/components/radix/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import { formatWalletAddress } from "@/lib/format";
import { usePrivy, useLogin } from "@privy-io/react-auth"

export const UserMenu = () => {
  const { user, logout } = usePrivy();
  const { login } = useLogin();

  const [mounted, setMounted] = useState(false);
  const [userState, setUserState] = useState(user);

  useEffect(() => {
    setMounted(true);
    setUserState(user);
  }, [user]);

  return (
    <SidebarMenuItem>
      {mounted && userState ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Wallet
                </span>
                {userState && (
                  <span className="truncate text-xs text-muted-foreground">
                    {formatWalletAddress(userState.wallet?.address || '')}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <SidebarMenuButton
          size="lg"
          className="cursor-pointer"
          onClick={login}
        >
          <span>Login</span>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
};
