import React, { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

// Create a simple context that uses the Zustand store
const AuthContext = createContext<ReturnType<typeof useAuthStore> | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Fallback to direct store access if context is not available
    return useAuthStore()
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authStore = useAuthStore()

  useEffect(() => {
    // Initialize auth on app start
    authStore.initialize()
  }, [])

  return (
    <AuthContext.Provider value={authStore}>
      {children}
    </AuthContext.Provider>
  )
}