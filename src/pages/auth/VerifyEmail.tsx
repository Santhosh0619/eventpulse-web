import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { authService } from '@/services/authService'
import type { ApiError } from '@/services/api'

type Status = 'verifying' | 'success' | 'error'

/** Verify an email address from the token in the verification link. */
export function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [status, setStatus] = useState<Status>('verifying')
  const [message, setMessage] = useState('')
  // Single-shot: a verify token is consumed by the backend, so it must be sent
  // exactly once. The ref guard suppresses StrictMode's dev double-invoke; the
  // empty dependency array means "run once on mount" (the token never changes
  // for a given page load from an email link).
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!token) {
      setStatus('error')
      setMessage('This verification link is missing its token.')
      return
    }
    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: ApiError) => {
        setStatus('error')
        setMessage(err.message)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card>
      {status === 'verifying' && (
        <div className="flex items-center gap-3 text-gray-700">
          <Spinner size="sm" />
          <span>Verifying your email…</span>
        </div>
      )}
      {status === 'success' && (
        <>
          <h2 className="mb-2 text-lg font-semibold text-green-700">Email verified</h2>
          <p className="text-sm text-gray-700">
            Your email is confirmed. You can now{' '}
            <Link to="/login" className="text-brand-600 hover:underline">
              log in
            </Link>
            .
          </p>
        </>
      )}
      {status === 'error' && (
        <>
          <h2 className="mb-2 text-lg font-semibold text-red-700">
            Verification failed
          </h2>
          <p className="text-sm text-gray-700">{message}</p>
        </>
      )}
    </Card>
  )
}
