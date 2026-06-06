interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[calc(100vh-160px)] flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
      {description && (
        <p className="mt-3 max-w-md text-secondary">{description}</p>
      )}
      <p className="mt-6 rounded-xl border border-dashed border-border bg-card px-6 py-4 text-sm text-secondary">
        This page will be built in the next phase.
      </p>
    </div>
  )
}
