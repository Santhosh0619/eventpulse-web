import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/forms/FormField'
import { eventService } from '@/services/eventService'
import { orgService } from '@/services/orgService'
import type { ApiError } from '@/services/api'
import type { Category } from '@/types/event'
import type { OrgWithRole } from '@/types/organization'

interface Draft {
  organization_id: string
  title: string
  short_description: string
  category_id: string
  venue_name: string
  city: string
  country: string
  start_datetime: string
  end_datetime: string
}

const EMPTY: Draft = {
  organization_id: '',
  title: '',
  short_description: '',
  category_id: '',
  venue_name: '',
  city: '',
  country: '',
  start_datetime: '',
  end_datetime: '',
}

/** Three-step wizard to create a draft event. */
export function EventCreate() {
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState<OrgWithRole[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    orgService
      .listMine()
      .then((list) => {
        setOrgs(list)
        if (list.length) setDraft((d) => ({ ...d, organization_id: list[0].id }))
      })
      .catch(() => undefined)
    eventService
      .listCategories()
      .then(setCategories)
      .catch(() => undefined)
  }, [])

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  const step1Valid = draft.organization_id && draft.title.trim()
  const step2Valid =
    draft.start_datetime &&
    draft.end_datetime &&
    new Date(draft.end_datetime) > new Date(draft.start_datetime)

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      const event = await eventService.create({
        organization_id: draft.organization_id,
        title: draft.title.trim(),
        short_description: draft.short_description || undefined,
        category_id: draft.category_id || null,
        venue_name: draft.venue_name || undefined,
        city: draft.city || undefined,
        country: draft.country || undefined,
        start_datetime: new Date(draft.start_datetime).toISOString(),
        end_datetime: new Date(draft.end_datetime).toISOString(),
      })
      navigate(`/events/${event.id}`)
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (orgs.length === 0) {
    return (
      <PageWrapper title="Create event">
        <Card>
          <p className="text-gray-700">
            You need to belong to an organization before creating events.
          </p>
        </Card>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Create event">
      <Card className="space-y-4">
        <p className="text-sm text-gray-500">Step {step} of 3</p>

        {step === 1 && (
          <>
            <FormField label="Organization" htmlFor="org">
              <Select
                id="org"
                value={draft.organization_id}
                onChange={(e) => set('organization_id', e.target.value)}
              >
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Title" htmlFor="title">
              <Input
                id="title"
                value={draft.title}
                onChange={(e) => set('title', e.target.value)}
                required
              />
            </FormField>
            <FormField label="Short description" htmlFor="short">
              <Textarea
                id="short"
                rows={3}
                value={draft.short_description}
                onChange={(e) => set('short_description', e.target.value)}
              />
            </FormField>
            <FormField label="Category" htmlFor="category">
              <Select
                id="category"
                value={draft.category_id}
                onChange={(e) => set('category_id', e.target.value)}
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </>
        )}

        {step === 2 && (
          <>
            <FormField label="Venue name" htmlFor="venue">
              <Input
                id="venue"
                value={draft.venue_name}
                onChange={(e) => set('venue_name', e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" htmlFor="city">
                <Input
                  id="city"
                  value={draft.city}
                  onChange={(e) => set('city', e.target.value)}
                />
              </FormField>
              <FormField label="Country" htmlFor="country">
                <Input
                  id="country"
                  value={draft.country}
                  onChange={(e) => set('country', e.target.value)}
                />
              </FormField>
            </div>
            <FormField label="Starts" htmlFor="start">
              <Input
                id="start"
                type="datetime-local"
                value={draft.start_datetime}
                onChange={(e) => set('start_datetime', e.target.value)}
                required
              />
            </FormField>
            <FormField
              label="Ends"
              htmlFor="end"
              error={
                draft.start_datetime && draft.end_datetime && !step2Valid
                  ? 'End must be after start'
                  : undefined
              }
            >
              <Input
                id="end"
                type="datetime-local"
                value={draft.end_datetime}
                onChange={(e) => set('end_datetime', e.target.value)}
                required
              />
            </FormField>
          </>
        )}

        {step === 3 && (
          <dl className="space-y-2 text-sm">
            <Row label="Title" value={draft.title} />
            <Row
              label="Organization"
              value={orgs.find((o) => o.id === draft.organization_id)?.name ?? ''}
            />
            <Row label="Venue" value={draft.venue_name || '—'} />
            <Row
              label="Location"
              value={[draft.city, draft.country].filter(Boolean).join(', ') || '—'}
            />
            <Row label="Starts" value={draft.start_datetime} />
            <Row label="Ends" value={draft.end_datetime} />
            <p className="pt-2 text-xs text-gray-500">
              The event is created as a draft. Add ticket tiers, then publish it.
            </p>
          </dl>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between pt-2">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting}>
              Create event
            </Button>
          )}
        </div>
      </Card>
    </PageWrapper>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
