import { create } from 'zustand';

interface NotificationState {
  notifications: Array<{ id: string; message: string; read: boolean }>;
  addNotification: (message: string) => void;
  markAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message) => set((state) => ({
    notifications: [{ id: Math.random().toString(), message, read: false }, ...state.notifications]
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
  })),
}));
