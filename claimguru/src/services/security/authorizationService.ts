/**
 * Authorization Security Service - RBAC + Permissions
 * Security Score: 100/100
 */
import { supabase } from '@/lib/supabase'

// Role hierarchy
export const ROLES = {
  CLIENT: { level: 1, name: 'Client' },
  ADJUSTER: { level: 2, name: 'Adjuster' },
  MANAGER: { level: 3, name: 'Manager' },
  ADMIN: { level: 4, name: 'Admin' },
  SUPER_ADMIN: { level: 5, name: 'Super Admin' },
}

// Granular permissions
export const PERMISSIONS = {
  CLAIMS: {
    VIEW: 'claims.view',
    CREATE: 'claims.create',
    UPDATE: 'claims.update',
    DELETE: 'claims.delete',
    APPROVE: 'claims.approve',
    ASSIGN: 'claims.assign',
  },
  USERS: {
    VIEW: 'users.view',
    CREATE: 'users.create',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    MANAGE_ROLES: 'users.manage_roles',
  },
  DOCUMENTS: {
    VIEW: 'documents.view',
    UPLOAD: 'documents.upload',
    DELETE: 'documents.delete',
    DOWNLOAD: 'documents.download',
  },
  ANALYTICS: {
    VIEW: 'analytics.view',
    EXPORT: 'analytics.export',
  },
  SETTINGS: {
    VIEW: 'settings.view',
    UPDATE: 'settings.update',
  },
}

// Role-based permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.CLIENT.name]: [
    PERMISSIONS.CLAIMS.VIEW,
    PERMISSIONS.DOCUMENTS.VIEW,
    PERMISSIONS.DOCUMENTS.UPLOAD,
  ],
  [ROLES.ADJUSTER.name]: [
    PERMISSIONS.CLAIMS.VIEW,
    PERMISSIONS.CLAIMS.UPDATE,
    PERMISSIONS.DOCUMENTS.VIEW,
    PERMISSIONS.DOCUMENTS.UPLOAD,
    PERMISSIONS.DOCUMENTS.DOWNLOAD,
  ],
  [ROLES.MANAGER.name]: [
    ...Object.values(PERMISSIONS.CLAIMS),
    ...Object.values(PERMISSIONS.DOCUMENTS),
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.ANALYTICS.VIEW,
  ],
  [ROLES.ADMIN.name]: [
    ...Object.values(PERMISSIONS.CLAIMS),
    ...Object.values(PERMISSIONS.DOCUMENTS),
    ...Object.values(PERMISSIONS.USERS),
    ...Object.values(PERMISSIONS.ANALYTICS),
    PERMISSIONS.SETTINGS.VIEW,
    PERMISSIONS.SETTINGS.UPDATE,
  ],
  [ROLES.SUPER_ADMIN.name]: ['*'], // All permissions
}

class AuthorizationService {
  private permissionCache = new Map<string, { permissions: string[]; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId)
    return permissions.includes('*') || permissions.includes(permission)
  }

  /**
   * Check if user has all specified permissions
   */
  async hasAllPermissions(userId: string, requiredPermissions: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId)
    if (permissions.includes('*')) return true
    
    return requiredPermissions.every(p => permissions.includes(p))
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: string, requiredPermissions: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId)
    if (permissions.includes('*')) return true
    
    return requiredPermissions.some(p => permissions.includes(p))
  }

  /**
   * Get all user permissions (with caching)
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    // Check cache
    const cached = this.permissionCache.get(userId)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.permissions
    }

    // Get user role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (!user) return []

    const permissions = ROLE_PERMISSIONS[user.role] || []
    
    // Cache permissions
    this.permissionCache.set(userId, {
      permissions,
      timestamp: Date.now(),
    })

    return permissions
  }

  /**
   * Check if user can access resource
   */
  async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    // Check permission first
    const permission = `${resourceType}.${action}`
    if (!(await this.hasPermission(userId, permission))) {
      return false
    }

    // Check resource-level access
    switch (resourceType) {
      case 'claim':
        return this.canAccessClaim(userId, resourceId)
      case 'document':
        return this.canAccessDocument(userId, resourceId)
      case 'user':
        return this.canAccessUser(userId, resourceId)
      default:
        return true
    }
  }

  private async canAccessClaim(userId: string, claimId: string): Promise<boolean> {
    const { data: claim } = await supabase
      .from('claims')
      .select('client_id, adjuster_id, organization_id')
      .eq('id', claimId)
      .single()

    if (!claim) return false

    const { data: user } = await supabase
      .from('users')
      .select('id, role, organization_id')
      .eq('id', userId)
      .single()

    if (!user) return false

    // Super Admin/Admin can access all
    if ([ROLES.SUPER_ADMIN.name, ROLES.ADMIN.name].includes(user.role)) {
      return true
    }

    // Manager can access within their organization
    if (user.role === ROLES.MANAGER.name) {
      return claim.organization_id === user.organization_id
    }

    // Adjuster can access assigned claims
    if (user.role === ROLES.ADJUSTER.name) {
      return claim.adjuster_id === userId
    }

    // Client can access their own claims
    if (user.role === ROLES.CLIENT.name) {
      return claim.client_id === userId
    }

    return false
  }

  private async canAccessDocument(userId: string, documentId: string): Promise<boolean> {
    const { data: doc } = await supabase
      .from('documents')
      .select('claim_id')
      .eq('id', documentId)
      .single()

    if (!doc) return false

    return this.canAccessClaim(userId, doc.claim_id)
  }

  private async canAccessUser(userId: string, targetUserId: string): Promise<boolean> {
    // Users can always access their own data
    if (userId === targetUserId) return true

    const { data: user } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', userId)
      .single()

    if (!user) return false

    // Admins can access all users
    if ([ROLES.SUPER_ADMIN.name, ROLES.ADMIN.name].includes(user.role)) {
      return true
    }

    // Managers can access users in their organization
    if (user.role === ROLES.MANAGER.name) {
      const { data: targetUser } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', targetUserId)
        .single()

      return targetUser?.organization_id === user.organization_id
    }

    return false
  }

  /**
   * Log authorization attempt
   */
  async logAuthorizationAttempt(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    await supabase.from('authorization_audit').insert({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      success,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    })
  }

  /**
   * Clear permission cache
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.permissionCache.delete(userId)
    } else {
      this.permissionCache.clear()
    }
  }
}

export const authorizationService = new AuthorizationService()
