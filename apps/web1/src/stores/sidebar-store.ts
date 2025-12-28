import { create } from "zustand";

interface SidebarStore {
  activeMenuTitle: string | null;
  setActiveMenu: (title: string | null) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  activeMenuTitle: null,
  setActiveMenu: (title) => set({ activeMenuTitle: title }),
}));
