import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { orgService } from '@/services/orgService'
import type { ApiError } from '@/services/api'

type Status = 'accepting' | 'success' | 'error'

/** Accept an organization invitation from its token (single-shot). */
export function InvitationAccept() {
  const { token = '' } = useParams()
  const [status, setStatus] = useState<Status>('accepting')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    orgService
      .acceptInvitation(token)
      .then((member) => {
        setOrgId(member.organization_id)
        setStatus('success')
      })
      .catch((err: ApiError) => {
        setStatus('error')
        setMessage(err.message)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageWrapper>
      <Card className="mx-auto max-w-md">
        {status === 'accepting' && (
          <div className="flex items-center gap-3 text-gray-700">
            <Spinner size="sm" />
            <span>Accepting invitation…</span>
          </div>
        )}
        {status === 'success' && (
          <>
            <h2 className="mb-2 text-lg font-semibold text-green-700">
              Invitation accepted
            </h2>
            <p className="text-sm text-gray-700">
              You&apos;ve joined the organization.{' '}
              <Link
                to={orgId ? `/organizations/${orgId}` : '/organizations'}
                className="text-brand-600 hover:underline"
              >
                View it
              </Link>
              .
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="mb-2 text-lg font-semibold text-red-700">
              Couldn&apos;t accept invitation
            </h2>
            <p className="text-sm text-gray-700">{message}</p>
          </>
        )}
      </Card>
    </PageWrapper>
  )
}
