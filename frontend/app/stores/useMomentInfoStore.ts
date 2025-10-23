import { create } from "zustand";
import MomentInfo from "../../components/momentInfo"; 

export default interface MomentInfoState {
  selectedMomentInfo: MomentInfo | null;
  setSelectedMomentInfo: (moment: MomentInfo) => void;
  clearMomentInfo: () => void;
}

export const useMomentInfoStore = create<MomentInfoState>((set) => ({
  selectedMomentInfo: null,
  setSelectedMomentInfo: (momentInfo) => set({ selectedMomentInfo: momentInfo }),
  clearMomentInfo: () => set({ selectedMomentInfo: null }),
}));
