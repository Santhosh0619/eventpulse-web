import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { FormField } from '@/components/forms/FormField'
import { orgService } from '@/services/orgService'
import type { ApiError } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { Member, Organization, OrgRole } from '@/types/organization'

const ADMIN_ROLES: OrgRole[] = ['owner', 'admin']

/** Organization detail: info, member management, invitations, and deletion. */
export function OrgDetail() {
  const { orgId = '' } = useParams()
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id)

  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<OrgRole>('member')
  const [inviting, setInviting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const loadMembers = useCallback(async () => {
    setMembers(await orgService.listMembers(orgId))
  }, [orgId])

  useEffect(() => {
    let ignore = false
    Promise.all([orgService.get(orgId), orgService.listMembers(orgId)])
      .then(([o, m]) => {
        if (ignore) return
        setOrg(o)
        setMembers(m)
      })
      .catch((err: ApiError) => {
        if (!ignore)
          setLoadError(err.status === 404 ? 'Organization not found.' : err.message)
      })
    return () => {
      ignore = true
    }
  }, [orgId])

  const myRole = members.find((m) => m.user_id === userId)?.role
  const canManage = myRole !== undefined && ADMIN_ROLES.includes(myRole)
  const isOwner = myRole === 'owner'

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    setActionError(null)
    setInviting(true)
    try {
      await orgService.invite(orgId, inviteEmail, inviteRole)
      setInviteEmail('')
      await loadMembers()
    } catch (err) {
      setActionError((err as ApiError).message)
    } finally {
      setInviting(false)
    }
  }

  async function handleRoleChange(member: Member, role: OrgRole) {
    if (!member.user_id) return
    setActionError(null)
    try {
      await orgService.changeMemberRole(orgId, member.user_id, role)
      await loadMembers()
    } catch (err) {
      setActionError((err as ApiError).message)
    }
  }

  async function handleRemove(member: Member) {
    if (!member.user_id) return
    setActionError(null)
    try {
      await orgService.removeMember(orgId, member.user_id)
      await loadMembers()
    } catch (err) {
      setActionError((err as ApiError).message)
    }
  }

  async function handleDelete() {
    setActionError(null)
    try {
      await orgService.remove(orgId)
      navigate('/organizations')
    } catch (err) {
      setActionError((err as ApiError).message)
    }
  }

  if (loadError) {
    return (
      <PageWrapper>
        <p className="py-16 text-center text-red-600">{loadError}</p>
      </PageWrapper>
    )
  }

  if (!org) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={org.name}>
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{org.contact_email}</p>
              {org.description && (
                <p className="mt-2 text-sm text-gray-700">{org.description}</p>
              )}
            </div>
            {org.is_verified && <Badge tone="success">Verified</Badge>}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Members</h2>
          <ul className="divide-y divide-surface-border">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {member.invited_email ?? member.user_id ?? 'Unknown'}
                  </p>
                  <Badge
                    tone={
                      member.invitation_status === 'pending' ? 'warning' : 'neutral'
                    }
                  >
                    {member.invitation_status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && member.user_id && member.user_id !== userId ? (
                    <Select
                      aria-label={`Role for ${member.invited_email ?? member.user_id}`}
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member, e.target.value as OrgRole)
                      }
                      className="h-8 w-28"
                    >
                      <option value="owner">owner</option>
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                    </Select>
                  ) : (
                    <Badge tone="brand">{member.role}</Badge>
                  )}
                  {/* Members can't remove themselves here (use "leave" flows). */}
                  {canManage && member.user_id !== userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {canManage && (
            <form
              onSubmit={handleInvite}
              className="mt-4 flex flex-wrap items-end gap-3"
            >
              <div className="flex-1">
                <FormField label="Invite by email" htmlFor="invite-email">
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </FormField>
              </div>
              <Select
                aria-label="Invite role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                className="h-10 w-28"
              >
                <option value="member">member</option>
                <option value="admin">admin</option>
              </Select>
              <Button type="submit" loading={inviting}>
                Invite
              </Button>
            </form>
          )}
          {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
        </Card>

        {isOwner && (
          <Card>
            <h2 className="mb-2 text-lg font-semibold text-red-700">Danger zone</h2>
            <p className="mb-3 text-sm text-gray-600">
              Deleting an organization removes it and its events permanently.
            </p>
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Delete organization
            </Button>
          </Card>
        )}
      </div>

      <Modal
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="Delete organization?"
      >
        <p className="mb-4 text-sm text-gray-700">
          This permanently deletes <strong>{org.name}</strong> and all of its events.
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
