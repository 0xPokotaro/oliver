import { RadixSidebarDemo } from "@/components/layout/sidebar-layout";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RadixSidebarDemo>{children}</RadixSidebarDemo>;
}
