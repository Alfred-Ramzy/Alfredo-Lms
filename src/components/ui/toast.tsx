import { create } from 'zustand'

type ToastItem = { id: number; title: string; description?: string }

interface ToastStore {
  items: ToastItem[]
  push: (toast: Omit<ToastItem, 'id'>) => void
  remove: (id: number) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  items: [],
  push: (toast) =>
    set((state) => ({
      items: [...state.items, { ...toast, id: Date.now() + Math.floor(Math.random() * 1000) }],
    })),
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}))

export function toast(input: Omit<ToastItem, 'id'>) {
  useToastStore.getState().push(input)
}
