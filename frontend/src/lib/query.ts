export type QueryParams = Partial<{
  branchId: string
  instituteId: string
  ownerId: string
  search: string
  isActive: string
}>

export function withQueryParams(endpoint: string, params?: QueryParams) {
  if (!params) return endpoint

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()

  if (!query) return endpoint

  return `${endpoint}?${query}`
}
