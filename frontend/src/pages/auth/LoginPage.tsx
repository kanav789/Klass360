import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname || '/enquiries'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password }, rememberMe)
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Unable to sign in. Please try again.'
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
          Welcome back
        </h1>
        <p className="mt-2 text-secondary">
          Please enter your details to sign in.
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
              <Label htmlFor="email">Email or Username</Label>
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
                  placeholder="••••••••"
                  className="pl-11 pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked === true)
                  }
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-normal text-secondary"
                >
                  Remember me
                </Label>
              </div>
              <a
                href="#"
                className="text-sm font-semibold text-primary transition-colors hover:text-lime-hover"
              >
                Forgot Password?
              </a>
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-secondary">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              disabled
            >
              <KeyRound className="h-4 w-4" />
              Sign in with SSO
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm text-secondary">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="font-semibold text-primary transition-colors hover:text-lime-hover"
        >
          Sign up
        </Link>
      </p>
    </AuthSplitLayout>
  )
}
