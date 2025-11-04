import { create } from "zustand";
interface User {
  id: string;
  username: string;
  email: string;
  pfp_url: string;
  bio: string;
  first_name: string;
  last_name: string;
}

export default interface selectedUsersState {
  selectedUsers: User[] | null;
  setUsersSelected: (moment: User[]) => void;
  clearSelectedUsers: () => void;
}

export const useSelectedUsersStore = create<selectedUsersState>((set) => ({
  selectedUsers: null,
  setUsersSelected: (usersSelected) => set({ selectedUsers: usersSelected }),
  clearSelectedUsers: () => set({ selectedUsers: null }),
}));
