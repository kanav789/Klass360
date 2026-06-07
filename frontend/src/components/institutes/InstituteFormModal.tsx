import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Building2, ImagePlus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getAssetUrl } from '@/lib/api'
import type { Institute, InstitutePayload } from '@/types/institute'

interface InstituteFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  institute?: Institute | null
  isSubmitting: boolean
  error: string
  onClose: () => void
  onSubmit: (data: InstitutePayload) => void
}

export function InstituteFormModal({
  open,
  mode,
  institute,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: InstituteFormModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')

  const existingLogoUrl = useMemo(
    () => (institute?.logo ? getAssetUrl(institute.logo) : ''),
    [institute?.logo],
  )

  useEffect(() => {
    if (open) {
      setName(institute?.name ?? '')
      setEmail(institute?.email ?? '')
      setPhone(institute?.phone ?? '')
      setAddress(institute?.address ?? '')
      setIsActive(institute?.isActive ?? true)
      setLogoFile(null)
      setLogoPreview(institute?.logo ? getAssetUrl(institute.logo) : '')
    }
  }, [open, institute])

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(existingLogoUrl)
      return
    }

    const objectUrl = URL.createObjectURL(logoFile)
    setLogoPreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [logoFile, existingLogoUrl])

  if (!open) return null

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setLogoFile(file)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    onSubmit({
      name,
      email,
      phone,
      address,
      isActive,
      logoFile,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] border border-border/60 bg-card p-6 shadow-[var(--shadow-card-hover)]">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {mode === 'create' ? 'Create Institute' : 'Edit Institute'}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Manage institute profile details and upload a logo for the
              sidebar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-background hover:text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="institute-logo">Institute Logo</Label>
            <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-background p-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-card">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Institute logo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-secondary" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label
                  htmlFor="institute-logo"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background"
                >
                  <ImagePlus className="h-4 w-4" />
                  {logoFile ? 'Change Logo' : 'Upload Logo'}
                </label>
                <input
                  id="institute-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleLogoChange}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-secondary">
                  JPEG, PNG, WEBP, or GIF. Max size 2MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="institute-name">
                Institute Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="institute-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="e.g. ABC Coaching Institute"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institute-email">
                Email <span className="text-danger">*</span>
              </Label>
              <Input
                id="institute-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="info@institute.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institute-phone">
                Phone <span className="text-danger">*</span>
              </Label>
              <Input
                id="institute-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="9876543210"
                maxLength={10}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="institute-address">
                Address <span className="text-danger">*</span>
              </Label>
              <Textarea
                id="institute-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Full institute address"
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
            <Checkbox
              id="institute-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="institute-active" className="cursor-pointer">
              Institute is active
            </Label>
          </div>

          <div className="flex justify-end gap-3 border-t border-border/60 pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Institute'
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
