import { create } from "zustand";
import type { DailyInfo } from "@/components/groupInfo";

export default interface DailyState {
  selectedDaily: DailyInfo | null;
  setSelectedDaily: (daily: DailyInfo) => void;
  clearDaily: () => void;
}

export const useDailyStore = create<DailyState>((set) => ({
  selectedDaily: null,
  setSelectedDaily: (daily) => set({ selectedDaily: daily }),
  clearDaily: () => set({ selectedDaily: null }),
}));
