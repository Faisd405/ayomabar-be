import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

/**
 * Metadata key for roles
 */
export const ROLES_KEY = 'roles';

/**
 * Roles decorator
 * Marks a route handler to require specific roles
 * 
 * @param roles - Array of roles that are allowed to access this route
 * 
 * @example
 * ```typescript
 * @Roles(Role.ADMIN, Role.SUPERADMIN)
 * @Get('admin-only')
 * async adminOnlyRoute() {
 *   return 'This is only accessible by admins';
 * }
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
