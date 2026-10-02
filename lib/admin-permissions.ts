export const STAFF_ROLES = ['owner','operations','finance','content'] as const;
export type StaffRole = typeof STAFF_ROLES[number];
export type AdminPermission = 'read' | 'owner' | 'orders' | 'inventory' | 'finance' | 'content' | 'operations';
export function hasAdminPermission(role: StaffRole, permission: AdminPermission): boolean {
  if (role === 'owner' || permission === 'read') return true;
  const grants: Record<Exclude<StaffRole,'owner'>, AdminPermission[]> = {
    operations: ['orders','inventory','operations'], finance: ['orders','finance'], content: ['content'],
  };
  return grants[role]?.includes(permission) || false;
}
