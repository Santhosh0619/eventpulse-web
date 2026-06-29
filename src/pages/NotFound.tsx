import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

/** 404 page for unmatched routes. */
export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-gray-600">This page could not be found.</p>
      <Link to="/">
        <Button>Go home</Button>
      </Link>
    </div>
  )
}
