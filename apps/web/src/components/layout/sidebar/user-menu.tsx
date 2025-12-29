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
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useLogin } from "@/hooks/use-login";
import { formatWalletAddress } from "@/lib/format";

const walletKey = "metamask";

export const UserMenu = () => {
  const { user, handleLogOut, primaryWallet } = useDynamicContext();
  const { login, isLoading } = useLogin();

  const [mounted, setMounted] = useState(false);
  const [userState, setUserState] = useState(user);
  const [walletAddressState, setWalletAddressState] = useState<string | undefined>(primaryWallet?.address);

  useEffect(() => {
    setMounted(true);
    setUserState(user);
    setWalletAddressState(primaryWallet?.address);
  }, [user, primaryWallet]);

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
                  Metamask
                </span>
                {walletAddressState && (
                  <span className="truncate text-xs text-muted-foreground">
                    {formatWalletAddress(walletAddressState)}
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
            <DropdownMenuItem onClick={handleLogOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button className="w-full" onClick={() => login({ walletKey })} disabled={isLoading}>
          <span>{isLoading ? "Logging in..." : "Login"}</span>
        </Button>
      )}
    </SidebarMenuItem>
  );
};
