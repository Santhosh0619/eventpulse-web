import { create } from 'zustand'

interface NotificationState {
  unreadCount: number
  setUnreadCount: (count: number) => void
}

/** Tracks the unread notification badge count shown in the navbar. */
export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}))
