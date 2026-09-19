import { create } from 'zustand'

interface HeroInteractionState {
  zoom: number
  minimized: boolean
  rotationX: number
  rotationY: number
  gestureEnabled: boolean
  lastGestureTime: number
  scrollLocked: boolean
  setZoom: (zoom: number) => void
  setMinimized: (minimized: boolean) => void
  setRotation: (x: number, y: number) => void
  setGestureEnabled: (enabled: boolean) => void
  setScrollLocked: (locked: boolean) => void
  updateGestureTime: () => void
  resetHeroInteraction: () => void
}

const initialState = {
  zoom: 1,
  minimized: false,
  rotationX: 0,
  rotationY: 0,
  gestureEnabled: false,
  lastGestureTime: 0,
  scrollLocked: false,
}

export const useHeroInteractionStore = create<HeroInteractionState>((set) => ({
  ...initialState,
  setZoom: (zoom) => set({ zoom: Math.max(0.75, Math.min(1.35, zoom)) }),
  setMinimized: (minimized) => set({ minimized }),
  setRotation: (rotationX, rotationY) => set({ rotationX, rotationY }),
  setGestureEnabled: (gestureEnabled) => set({ gestureEnabled }),
  setScrollLocked: (scrollLocked) => set({ scrollLocked }),
  updateGestureTime: () => set({ lastGestureTime: Date.now() }),
  resetHeroInteraction: () => set({
    zoom: 1,
    minimized: false,
    rotationX: 0,
    rotationY: 0,
  }),
}))