import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import { useInstitute } from '@/context/InstituteContext'
import { branchService } from '@/services/branchService'
import type { Branch } from '@/types/branch'

const BRANCH_FILTER_KEY = 'klass360_selected_branch'

interface BranchFilterContextValue {
  branches: Branch[]
  selectedBranchId: string
  selectedBranch: Branch | null
  isBranchSelected: boolean
  isLoadingBranches: boolean
  setSelectedBranchId: (branchId: string) => void
  refreshBranches: () => Promise<void>
}

const BranchFilterContext = createContext<BranchFilterContextValue | null>(null)

export function BranchFilterProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { institute } = useInstitute()
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchIdState] = useState(() =>
    sessionStorage.getItem(BRANCH_FILTER_KEY) ?? '',
  )
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)

  const refreshBranches = useCallback(async () => {
    if (!isAuthenticated) {
      setBranches([])
      return
    }

    setIsLoadingBranches(true)

    try {
      const response = await branchService.getAll({
        instituteId: institute?.id,
      })
      const activeBranches = response.data.branches.filter(
        (branch) => branch.status === 'active',
      )
      setBranches(activeBranches)

      if (
        selectedBranchId &&
        !activeBranches.some((branch) => branch.id === selectedBranchId)
      ) {
        setSelectedBranchIdState('')
        sessionStorage.removeItem(BRANCH_FILTER_KEY)
      }
    } catch {
      setBranches([])
    } finally {
      setIsLoadingBranches(false)
    }
  }, [institute?.id, isAuthenticated, selectedBranchId])

  useEffect(() => {
    refreshBranches()
  }, [refreshBranches])

  const setSelectedBranchId = useCallback((branchId: string) => {
    setSelectedBranchIdState(branchId)

    if (branchId) {
      sessionStorage.setItem(BRANCH_FILTER_KEY, branchId)
    } else {
      sessionStorage.removeItem(BRANCH_FILTER_KEY)
    }
  }, [])

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedBranchId) ?? null,
    [branches, selectedBranchId],
  )

  const value = useMemo(
    () => ({
      branches,
      selectedBranchId,
      selectedBranch,
      isBranchSelected: Boolean(selectedBranchId),
      isLoadingBranches,
      setSelectedBranchId,
      refreshBranches,
    }),
    [
      branches,
      selectedBranchId,
      selectedBranch,
      isLoadingBranches,
      setSelectedBranchId,
      refreshBranches,
    ],
  )

  return (
    <BranchFilterContext.Provider value={value}>
      {children}
    </BranchFilterContext.Provider>
  )
}

export function useBranchFilter() {
  const context = useContext(BranchFilterContext)

  if (!context) {
    throw new Error('useBranchFilter must be used within BranchFilterProvider')
  }

  return context
}
