import { create } from "zustand";

const useStore = create((set) => ({
    // 유저 state
    userId: '',
    updateUserId: (userId) => set(() => ({ userId: userId })),

    // 다이얼로그 state
    open: false,
    dialogName: '',
    openDialog: (dialogName) => set(() => ({ open: true, dialogName: dialogName })),
    updateOpen: (open) => set(() => ({ open: open })),

}));

export default useStore;