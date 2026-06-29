import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { authService } from '@/services/authService'
import type { ApiError } from '@/services/api'

/** New-account registration form. */
export function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authService.register(form)
      navigate('/login')
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Create your account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="First name" htmlFor="first_name">
          <Input
            id="first_name"
            value={form.first_name}
            onChange={update('first_name')}
            required
          />
        </FormField>
        <FormField label="Last name" htmlFor="last_name">
          <Input
            id="last_name"
            value={form.last_name}
            onChange={update('last_name')}
            required
          />
        </FormField>
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={update('email')}
            required
          />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={update('password')}
            required
          />
        </FormField>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Register
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  )
}
