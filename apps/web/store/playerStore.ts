import { create } from 'zustand';

interface PlayerState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setTime: (currentTime: number) => void;
  setDuration: (duration: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
}));
