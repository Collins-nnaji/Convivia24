/**
 * Role definitions and permissions
 */

export const ROLES = {
  CLIENT: 'client',
  STAFF: 'staff',
  SECURITY_STAFF: 'security_staff',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
};

/**
 * Check if user has a specific role
 */
export function hasRole(user, role) {
  return user?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user, roles) {
  return roles.includes(user?.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user) {
  return hasRole(user, ROLES.ADMIN);
}

/**
 * Check if user is client
 */
export function isClient(user) {
  return hasRole(user, ROLES.CLIENT);
}

/**
 * Check if user is staff (cleaning or security)
 */
export function isStaff(user) {
  return hasRole(user, ROLES.STAFF) || hasRole(user, ROLES.SECURITY_STAFF);
}

/**
 * Check if user is security staff
 */
export function isSecurityStaff(user) {
  return hasRole(user, ROLES.SECURITY_STAFF);
}

/**
 * Check if user is supervisor
 */
export function isSupervisor(user) {
  return hasRole(user, ROLES.SUPERVISOR);
}

/**
 * Get allowed routes for a role
 */
export function getAllowedRoutes(role) {
  const routes = {
    [ROLES.CLIENT]: [
      '/client/dashboard',
      '/client/request',
      '/client/jobs',
      '/client/invoices',
      '/client/profile',
    ],
    [ROLES.STAFF]: [
      '/staff/dashboard',
      '/staff/jobs',
      '/staff/profile',
    ],
    [ROLES.SECURITY_STAFF]: [
      '/staff/dashboard',
      '/staff/jobs',
      '/staff/profile',
    ],
    [ROLES.SUPERVISOR]: [
      '/supervisor/jobs',
      '/supervisor/team',
    ],
    [ROLES.ADMIN]: [
      '/admin/dashboard',
      '/admin/jobs',
      '/admin/clients',
      '/admin/staff',
      '/admin/services',
      '/admin/compliance',
      '/admin/settings',
    ],
  };

  return routes[role] || [];
}

/**
 * Get navigation items for a role
 */
export function getNavigationItems(role) {
  const navItems = {
    [ROLES.CLIENT]: [
      { label: 'Dashboard', path: '/client/dashboard', icon: 'LayoutDashboard' },
      { label: 'Request Service', path: '/client/request', icon: 'Plus' },
      { label: 'My Jobs', path: '/client/jobs', icon: 'Briefcase' },
      { label: 'Invoices', path: '/client/invoices', icon: 'Receipt' },
      { label: 'Profile', path: '/client/profile', icon: 'User' },
    ],
    [ROLES.STAFF]: [
      { label: 'Dashboard', path: '/staff/dashboard', icon: 'LayoutDashboard' },
      { label: 'My Jobs', path: '/staff/jobs', icon: 'Briefcase' },
      { label: 'Profile', path: '/staff/profile', icon: 'User' },
    ],
    [ROLES.SECURITY_STAFF]: [
      { label: 'Dashboard', path: '/staff/dashboard', icon: 'LayoutDashboard' },
      { label: 'My Assignments', path: '/staff/jobs', icon: 'Briefcase' },
      { label: 'Profile', path: '/staff/profile', icon: 'User' },
    ],
    [ROLES.SUPERVISOR]: [
      { label: 'Jobs', path: '/supervisor/jobs', icon: 'ClipboardCheck' },
      { label: 'Team', path: '/supervisor/team', icon: 'Users' },
      { label: 'Profile', path: '/supervisor/profile', icon: 'User' },
    ],
    [ROLES.ADMIN]: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
      { label: 'Jobs', path: '/admin/jobs', icon: 'Briefcase' },
      { label: 'Clients', path: '/admin/clients', icon: 'Building' },
      { label: 'Staff', path: '/admin/staff', icon: 'Users' },
      { label: 'Services', path: '/admin/services', icon: 'List' },
      { label: 'Compliance', path: '/admin/compliance', icon: 'ShieldCheck' },
      { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
    ],
  };

  return navItems[role] || [];
}
