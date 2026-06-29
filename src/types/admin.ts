export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'organizer' | 'attendee'
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface AdminOrg {
  id: string
  name: string
  slug: string
  contact_email: string
  is_verified: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AdminDashboard {
  total_users: number
  total_organizations: number
  unverified_organizations: number
  total_events: number
  draft_events: number
  total_orders: number
  total_audit_logs: number
}
