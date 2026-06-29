export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  data: Record<string, unknown>
  channel: string
  is_read: boolean
  read_at: string | null
  created_at: string
}
