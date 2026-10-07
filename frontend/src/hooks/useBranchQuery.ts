import { useMemo } from 'react'
import { useBranchFilter } from '@/context/BranchFilterContext'
import { useInstitute } from '@/context/InstituteContext'
import type { ListQueryParams } from '@/types/user'

export function useBranchQuery(): ListQueryParams | undefined {
  const { selectedBranchId } = useBranchFilter()
  const { selectedInstituteId } = useInstitute()

  return useMemo(() => {
    const params: ListQueryParams = {}

    if (selectedInstituteId) {
      params.instituteId = selectedInstituteId
    }

    if (selectedBranchId) {
      params.branchId = selectedBranchId
    }

    return Object.keys(params).length > 0 ? params : undefined
  }, [selectedInstituteId, selectedBranchId])
}
