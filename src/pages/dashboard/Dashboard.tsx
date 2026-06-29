import { Link } from 'react-router-dom'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'

/** Organizer dashboard landing page (expanded in later phases). */
export function Dashboard() {
  const user = useAuthStore((s) => s.user)
  return (
    <PageWrapper
      title="Dashboard"
      actions={
        <Link to="/events/new">
          <Button>Create event</Button>
        </Link>
      }
    >
      <Card>
        <p className="text-gray-700">
          Welcome{user?.email ? `, ${user.email}` : ''}. Your events, analytics, and
          attendees will appear here.
        </p>
      </Card>
    </PageWrapper>
  )
}
