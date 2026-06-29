import { api } from '@/services/api'
import type { OrgWithRole } from '@/types/organization'

/** Organization API calls. */
export const orgService = {
  /** List the organizations the current user belongs to, with their role. */
  async listMine(): Promise<OrgWithRole[]> {
    const { data } = await api.get<OrgWithRole[]>('/api/v1/users/me/organizations')
    return data
  },
}
