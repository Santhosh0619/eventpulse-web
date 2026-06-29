import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { authService } from '@/services/authService'
import type { ApiError } from '@/services/api'

/** Set a new password using the token from the reset-link query string. */
export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Card>
        <h2 className="mb-2 text-lg font-semibold text-green-700">Password updated</h2>
        <p className="text-sm text-gray-700">
          Your password has been reset. You can now{' '}
          <Link to="/login" className="text-brand-600 hover:underline">
            log in
          </Link>
          .
        </p>
      </Card>
    )
  }

  if (!token) {
    return (
      <Card>
        <h2 className="mb-2 text-lg font-semibold">Invalid reset link</h2>
        <p className="text-sm text-gray-700">
          This link is missing its token. Request a new one from{' '}
          <Link to="/forgot-password" className="text-brand-600 hover:underline">
            forgot password
          </Link>
          .
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Choose a new password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="New password" htmlFor="password">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </FormField>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Reset password
        </Button>
      </form>
    </Card>
  )
}
