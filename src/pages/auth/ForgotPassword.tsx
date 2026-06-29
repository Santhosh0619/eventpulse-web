import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { authService } from '@/services/authService'
import type { ApiError } from '@/services/api'

/** Request a password-reset link. Always reports success (no account enumeration). */
export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSubmitted(true)
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Reset your password</h2>
      {submitted ? (
        <p className="text-sm text-gray-700">
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-gray-600">
        <Link to="/login" className="text-brand-600 hover:underline">
          Back to log in
        </Link>
      </p>
    </Card>
  )
}
