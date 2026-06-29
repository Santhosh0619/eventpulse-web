import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { FormField } from '@/components/forms/FormField'
import { orgService } from '@/services/orgService'
import type { ApiError } from '@/services/api'
import type { OrgWithRole } from '@/types/organization'

/** Lists the user's organizations and offers a create form. */
export function OrgList() {
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState<OrgWithRole[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let ignore = false
    orgService
      .listMine()
      .then((list) => !ignore && setOrgs(list))
      .catch((err: ApiError) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setCreating(true)
    try {
      const org = await orgService.create({ name: name.trim(), contact_email: email })
      navigate(`/organizations/${org.id}`)
    } catch (err) {
      setFormError((err as ApiError).message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <PageWrapper
      title="Organizations"
      actions={
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Close' : 'New organization'}
        </Button>
      }
    >
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField label="Name" htmlFor="org-name">
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Contact email" htmlFor="org-email">
              <Input
                id="org-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <Button type="submit" loading={creating}>
              Create organization
            </Button>
          </form>
        </Card>
      )}

      {error ? (
        <p className="py-16 text-center text-red-600">{error}</p>
      ) : orgs === null ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : orgs.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          You don&apos;t belong to any organizations yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link key={org.id} to={`/organizations/${org.id}`} className="block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{org.name}</h3>
                  {org.is_verified && <Badge tone="success">Verified</Badge>}
                </div>
                <Badge tone="brand">{org.my_role}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
