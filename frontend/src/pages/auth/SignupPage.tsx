import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api'

export function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Policy')
      return
    }

    setIsSubmitting(true)

    try {
      await register({ fullName, email, password })
      navigate('/enquiries', { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Unable to create account. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthSplitLayout>
      <Logo className="mb-8" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Create your account
        </h1>
        <p className="mt-2 text-secondary">
          Get started with Klass360 for your institution.
        </p>
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-7 pt-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-11"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@klass360.edu"
                  className="pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="pl-11 pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary transition-colors hover:text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-secondary">
                Must be 8+ characters with uppercase, lowercase, and a number.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-11 pr-11"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary transition-colors hover:text-primary"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                className="mt-0.5"
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
                disabled={isSubmitting}
              />
              <Label
                htmlFor="terms"
                className="cursor-pointer text-sm font-normal leading-relaxed text-secondary"
              >
                I agree to the{' '}
                <a href="#" className="font-medium text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </a>
              </Label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm text-secondary">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary transition-colors hover:text-lime-hover"
        >
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  )
}
