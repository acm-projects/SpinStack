import { create } from "zustand";
import type { Moment } from "../../components/momentInfo"; 

export default interface MomentState {
  selectedMoment: Moment | null;
  setSelectedMoment: (moment: Moment) => void;
  clearMoment: () => void;
}

export const useMomentStore = create<MomentState>((set) => ({
  selectedMoment: null,
  setSelectedMoment: (moment) => set({ selectedMoment: moment }),
  clearMoment: () => set({ selectedMoment: null }),
}));
