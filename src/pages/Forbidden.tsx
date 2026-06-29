import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

/** 403 page shown when an authenticated user lacks the required role. */
export function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-gray-800">403</h1>
      <p className="text-gray-600">You do not have access to this page.</p>
      <Link to="/dashboard">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
