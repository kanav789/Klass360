import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getAssetUrl } from '@/lib/api'
import { instituteService } from '@/services/instituteService'
import type { Institute } from '@/types/institute'
import { useAuth } from '@/context/AuthContext'

interface InstituteContextValue {
  institute: Institute | null
  instituteName: string
  instituteLogoUrl: string
  isLoading: boolean
  refreshInstitute: () => Promise<void>
}

const InstituteContext = createContext<InstituteContextValue | null>(null)

export function InstituteProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [institute, setInstitute] = useState<Institute | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshInstitute = useCallback(async () => {
    if (!isAuthenticated) {
      setInstitute(null)
      return
    }

    setIsLoading(true)

    try {
      const response = await instituteService.getActive()
      setInstitute(response.data.institute)
    } catch {
      setInstitute(null)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshInstitute()
  }, [refreshInstitute])

  const value = useMemo(
    () => ({
      institute,
      instituteName: institute?.name ?? 'Klass360',
      instituteLogoUrl: institute?.logo ? getAssetUrl(institute.logo) : '',
      isLoading,
      refreshInstitute,
    }),
    [institute, isLoading, refreshInstitute],
  )

  return (
    <InstituteContext.Provider value={value}>
      {children}
    </InstituteContext.Provider>
  )
}

export function useInstitute() {
  const context = useContext(InstituteContext)

  if (!context) {
    throw new Error('useInstitute must be used within InstituteProvider')
  }

  return context
}
