import { api } from '@/services/api'
import type {
  Member,
  Organization,
  OrgCreateInput,
  OrgRole,
  OrgUpdateInput,
  OrgWithRole,
} from '@/types/organization'

const BASE = '/api/v1/organizations'

/** Organization and membership API calls. */
export const orgService = {
  /** List the organizations the current user belongs to, with their role. */
  async listMine(): Promise<OrgWithRole[]> {
    const { data } = await api.get<OrgWithRole[]>('/api/v1/users/me/organizations')
    return data
  },

  async get(id: string): Promise<Organization> {
    const { data } = await api.get<Organization>(`${BASE}/${id}`)
    return data
  },

  async create(input: OrgCreateInput): Promise<Organization> {
    const { data } = await api.post<Organization>(BASE, input)
    return data
  },

  async update(id: string, input: OrgUpdateInput): Promise<Organization> {
    const { data } = await api.put<Organization>(`${BASE}/${id}`, input)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}`)
  },

  async listMembers(id: string): Promise<Member[]> {
    const { data } = await api.get<Member[]>(`${BASE}/${id}/members`)
    return data
  },

  async invite(id: string, email: string, role: OrgRole): Promise<void> {
    await api.post(`${BASE}/${id}/members/invite`, { email, role })
  },

  async changeMemberRole(id: string, userId: string, role: OrgRole): Promise<Member> {
    const { data } = await api.put<Member>(`${BASE}/${id}/members/${userId}/role`, {
      role,
    })
    return data
  },

  async removeMember(id: string, userId: string): Promise<void> {
    await api.delete(`${BASE}/${id}/members/${userId}`)
  },

  async acceptInvitation(token: string): Promise<Member> {
    const { data } = await api.post<Member>(`${BASE}/invitations/${token}/accept`)
    return data
  },
}
