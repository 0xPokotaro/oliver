"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { formatWalletAddress } from "@/lib/format";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/use-auth-login";

export const UserMenu = () => {
  const { ready, user, logout, authenticated } = usePrivy();
  const { login } = useLogin();
  const router = useRouter();

  const disableLogin = !ready || (ready && authenticated);

  const [mounted, setMounted] = useState(false);
  const [userState, setUserState] = useState(user);

  useEffect(() => {
    setMounted(true);
    setUserState(user);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <SidebarMenuItem>
      {mounted && disableLogin ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Wallet</span>
                {userState && (
                  <span className="truncate text-xs text-muted-foreground">
                    {formatWalletAddress(
                      userState.wallet?.address || "",
                      10,
                      10,
                    )}
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
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button className="w-full" onClick={login}>
          Login
        </Button>
      )}
    </SidebarMenuItem>
  );
};
