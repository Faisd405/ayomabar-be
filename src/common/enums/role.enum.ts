/**
 * User role enumeration
 * Defines the available roles in the system with their hierarchy
 */
export enum Role {
  /**
   * Superadmin - Has unrestricted access to all system features
   * Can manage all users, including other admins
   */
  SUPERADMIN = 'superadmin',

  /**
   * Admin - Has elevated privileges
   * Can manage users and perform administrative tasks
   */
  ADMIN = 'admin',

  /**
   * User - Regular user with standard access
   * Can manage their own resources only
   */
  USER = 'user',
}

/**
 * Role hierarchy levels (higher number = more privileges)
 */
export const RoleHierarchy: Record<Role, number> = {
  [Role.SUPERADMIN]: 3,
  [Role.ADMIN]: 2,
  [Role.USER]: 1,
};

/**
 * Check if a role has at least the required level
 */
export function hasMinimumRole(
  userRoles: string[],
  requiredRole: Role,
): boolean {
  const requiredLevel = RoleHierarchy[requiredRole];
  return userRoles.some((role) => {
    const roleLevel = RoleHierarchy[role as Role];
    return roleLevel >= requiredLevel;
  });
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRoles: string[], role: Role): boolean {
  return userRoles.includes(role);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRoles: string[], roles: Role[]): boolean {
  return roles.some((role) => userRoles.includes(role));
}

/**
 * Get all roles as an array of strings
 */
export function getAllRoles(): string[] {
  return Object.values(Role);
}
