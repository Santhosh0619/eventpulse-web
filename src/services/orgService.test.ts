import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/services/api'
import { orgService } from '@/services/orgService'

vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe('orgService', () => {
  it('listMine hits the user-orgs endpoint', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    await orgService.listMine()
    expect(api.get).toHaveBeenCalledWith('/api/v1/users/me/organizations')
  })

  it('get / listMembers request the right paths', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })
    await orgService.get('o1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/organizations/o1')
    await orgService.listMembers('o1')
    expect(api.get).toHaveBeenCalledWith('/api/v1/organizations/o1/members')
  })

  it('update puts changed fields and remove deletes the org', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await orgService.update('o1', { name: 'Renamed' })
    expect(api.put).toHaveBeenCalledWith('/api/v1/organizations/o1', {
      name: 'Renamed',
    })
    vi.mocked(api.delete).mockResolvedValue({ data: undefined })
    await orgService.remove('o1')
    expect(api.delete).toHaveBeenCalledWith('/api/v1/organizations/o1')
  })

  it('create posts the new organization', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'o1' } })
    await orgService.create({ name: 'Org', contact_email: 'o@e.com' })
    expect(api.post).toHaveBeenCalledWith('/api/v1/organizations', {
      name: 'Org',
      contact_email: 'o@e.com',
    })
  })

  it('invite posts email and role', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await orgService.invite('o1', 'a@b.com', 'admin')
    expect(api.post).toHaveBeenCalledWith('/api/v1/organizations/o1/members/invite', {
      email: 'a@b.com',
      role: 'admin',
    })
  })

  it('changeMemberRole puts the new role', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { id: 'm1' } })
    await orgService.changeMemberRole('o1', 'u1', 'owner')
    expect(api.put).toHaveBeenCalledWith('/api/v1/organizations/o1/members/u1/role', {
      role: 'owner',
    })
  })

  it('removeMember deletes the membership', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: undefined })
    await orgService.removeMember('o1', 'u1')
    expect(api.delete).toHaveBeenCalledWith('/api/v1/organizations/o1/members/u1')
  })

  it('acceptInvitation posts to the token endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { organization_id: 'o1' } })
    const m = await orgService.acceptInvitation('tok')
    expect(api.post).toHaveBeenCalledWith(
      '/api/v1/organizations/invitations/tok/accept',
    )
    expect(m.organization_id).toBe('o1')
  })
})
