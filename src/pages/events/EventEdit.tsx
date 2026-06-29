import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/forms/FormField'
import { eventService } from '@/services/eventService'
import type { ApiError } from '@/services/api'

/** Convert an ISO timestamp to a `datetime-local` input value (local time). */
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

interface Form {
  title: string
  short_description: string
  venue_name: string
  city: string
  country: string
  start_datetime: string
  end_datetime: string
}

/** Edit an existing event's details. */
export function EventEdit() {
  const { eventId = '' } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<Form | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ignore = false
    eventService
      .getById(eventId)
      .then((e) => {
        if (ignore) return
        setForm({
          title: e.title,
          short_description: e.short_description ?? '',
          venue_name: e.venue_name ?? '',
          city: e.city ?? '',
          country: e.country ?? '',
          start_datetime: toLocalInput(e.start_datetime),
          end_datetime: toLocalInput(e.end_datetime),
        })
      })
      .catch((err: ApiError) => {
        if (!ignore) setLoadError(err.status === 404 ? 'Event not found.' : err.message)
      })
    return () => {
      ignore = true
    }
  }, [eventId])

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    setError(null)
    setSaving(true)
    try {
      await eventService.update(eventId, {
        title: form.title.trim(),
        short_description: form.short_description || undefined,
        venue_name: form.venue_name || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        start_datetime: new Date(form.start_datetime).toISOString(),
        end_datetime: new Date(form.end_datetime).toISOString(),
      })
      navigate(`/events/${eventId}`)
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  if (loadError) {
    return (
      <PageWrapper>
        <p className="py-16 text-center text-red-600">{loadError}</p>
      </PageWrapper>
    )
  }

  if (!form) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Edit event">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" htmlFor="title">
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Short description" htmlFor="short">
            <Textarea
              id="short"
              rows={3}
              value={form.short_description}
              onChange={(e) => set('short_description', e.target.value)}
            />
          </FormField>
          <FormField label="Venue name" htmlFor="venue">
            <Input
              id="venue"
              value={form.venue_name}
              onChange={(e) => set('venue_name', e.target.value)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="City" htmlFor="city">
              <Input
                id="city"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
              />
            </FormField>
            <FormField label="Country" htmlFor="country">
              <Input
                id="country"
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Starts" htmlFor="start">
            <Input
              id="start"
              type="datetime-local"
              value={form.start_datetime}
              onChange={(e) => set('start_datetime', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Ends" htmlFor="end">
            <Input
              id="end"
              type="datetime-local"
              value={form.end_datetime}
              onChange={(e) => set('end_datetime', e.target.value)}
              required
            />
          </FormField>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/events/${eventId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </PageWrapper>
  )
}
