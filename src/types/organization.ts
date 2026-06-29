/** An organization the current user belongs to, with their role in it. */
export interface OrgWithRole {
  id: string
  name: string
  slug: string
  contact_email: string
  is_verified: boolean
  created_at: string
  my_role: 'owner' | 'admin' | 'member'
}
