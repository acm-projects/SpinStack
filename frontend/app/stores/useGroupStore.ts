import { create } from "zustand";
import GroupInfo from "../../components/groupInfo"; 

export default interface GroupState {
  selectedGroup: GroupInfo | null;
  setSelectedGroup: (moment: GroupInfo) => void;
  clearGroup: () => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  selectedGroup: null,
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  clearGroup: () => set({ selectedGroup: null }),
}));
