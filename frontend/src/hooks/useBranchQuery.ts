import { useMemo } from 'react'
import { useBranchFilter } from '@/context/BranchFilterContext'
import type { ListQueryParams } from '@/types/user'

export function useBranchQuery(): ListQueryParams | undefined {
  const { selectedBranchId } = useBranchFilter()

  return useMemo(
    () => (selectedBranchId ? { branchId: selectedBranchId } : undefined),
    [selectedBranchId],
  )
}
