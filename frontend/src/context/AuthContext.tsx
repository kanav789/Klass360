import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '@/lib/api'
import { authService } from '@/services/authService'
import type { Admin, LoginPayload, RegisterPayload } from '@/types/auth'

interface AuthContextValue {
  admin: Admin | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload, remember?: boolean) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const bootstrapSession = useCallback(async () => {
    const token = getStoredToken()

    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await authService.getMe()
      setAdmin(response.data.admin)
    } catch {
      clearStoredToken()
      setAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    bootstrapSession()
  }, [bootstrapSession])

  const login = useCallback(
    async (payload: LoginPayload, remember = false) => {
      const response = await authService.login(payload)
      setStoredToken(response.data.token, remember)
      setAdmin(response.data.admin)
    },
    [],
  )

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload)
    setStoredToken(response.data.token, true)
    setAdmin(response.data.admin)
  }, [])

  const logout = useCallback(async () => {
    try {
      if (getStoredToken()) {
        await authService.logout()
      }
    } catch {
      // Client-side logout still proceeds if API call fails.
    } finally {
      clearStoredToken()
      setAdmin(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      isLoading,
      login,
      register,
      logout,
    }),
    [admin, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
