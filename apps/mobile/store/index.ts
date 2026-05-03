import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface AuthState {
  accessToken: string | null;
  user: { id: string; displayName: string; email: string; avatarUrl?: string } | null;
  setAuth: (token: string, user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: storage.getString('accessToken') ?? null,
  user: (() => { try { return JSON.parse(storage.getString('user') ?? 'null'); } catch { return null; } })(),
  setAuth: (accessToken, user) => {
    storage.set('accessToken', accessToken);
    storage.set('user', JSON.stringify(user));
    set({ accessToken, user });
  },
  logout: () => {
    storage.delete('accessToken');
    storage.delete('user');
    set({ accessToken: null, user: null });
  }
}));

interface PlayerState {
  miniPlayerVideo: { id: string; title: string; channelName: string } | null;
  isPlaying: boolean;
  setMiniPlayer: (v: PlayerState['miniPlayerVideo']) => void;
  dismissMiniPlayer: () => void;
  togglePlay: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  miniPlayerVideo: null,
  isPlaying: false,
  setMiniPlayer: (miniPlayerVideo) => set({ miniPlayerVideo, isPlaying: true }),
  dismissMiniPlayer: () => set({ miniPlayerVideo: null, isPlaying: false }),
  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
}));
