// src/stores/authStore.ts
import { create } from 'zustand'

interface AuthState {
  // UI loading states
  isLoggingOut: boolean
  
  // Actions
  setIsLoggingOut: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggingOut: false,
  
  setIsLoggingOut: (loading) => set({ isLoggingOut: loading })
}))