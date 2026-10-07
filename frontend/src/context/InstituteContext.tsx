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

const SELECTED_INSTITUTE_KEY = 'klass360_selected_institute'

const getStoredInstituteId = (): string | null =>
  sessionStorage.getItem(SELECTED_INSTITUTE_KEY)

const storeInstituteId = (id: string | null) => {
  if (id) {
    sessionStorage.setItem(SELECTED_INSTITUTE_KEY, id)
  } else {
    sessionStorage.removeItem(SELECTED_INSTITUTE_KEY)
  }
}

interface InstituteContextValue {
  institutes: Institute[]
  institute: Institute | null
  selectedInstituteId: string | null
  instituteName: string
  instituteLogoUrl: string
  isLoading: boolean
  selectInstitute: (id: string) => void
  refreshInstitute: () => Promise<void>
}

const InstituteContext = createContext<InstituteContextValue | null>(null)

export function InstituteProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [institutes, setInstitutes] = useState<Institute[]>([])
  const [institute, setInstitute] = useState<Institute | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshInstitute = useCallback(async () => {
    if (!isAuthenticated) {
      setInstitutes([])
      setInstitute(null)
      storeInstituteId(null)
      return
    }

    setIsLoading(true)

    try {
      const response = await instituteService.getAll()
      const list = response.data.institutes
      setInstitutes(list)

      const storedId = getStoredInstituteId()
      const next = list.find((item) => item.id === storedId) ?? list[0] ?? null

      storeInstituteId(next?.id ?? null)
      setInstitute(next)
    } catch {
      setInstitutes([])
      setInstitute(null)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshInstitute()
  }, [refreshInstitute])

  const selectInstitute = useCallback(
    (id: string) => {
      const next = institutes.find((item) => item.id === id)

      if (!next) {
        return
      }

      storeInstituteId(id)
      setInstitute(next)
    },
    [institutes],
  )

  const value = useMemo(
    () => ({
      institutes,
      institute,
      selectedInstituteId: institute?.id ?? null,
      instituteName: institute?.name ?? 'Klass360',
      instituteLogoUrl: institute?.logo ? getAssetUrl(institute.logo) : '',
      isLoading,
      selectInstitute,
      refreshInstitute,
    }),
    [institutes, institute, isLoading, selectInstitute, refreshInstitute],
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
