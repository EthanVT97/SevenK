export type UserRole = 'user' | 'moderator' | 'finance' | 'admin' | 'super_admin';

export interface RolePermissions {
    [key: string]: string[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
    user: [
        'view_own_profile',
        'edit_own_profile',
        'view_own_transactions',
        'place_bets',
        'request_withdrawal'
    ],
    moderator: [
        'view_users',
        'view_transactions',
        'handle_support_tickets',
        'send_notifications',
        'block_users'
    ],
    finance: [
        'view_transactions',
        'approve_withdrawals',
        'reject_withdrawals',
        'view_financial_reports',
        'handle_payment_issues'
    ],
    admin: [
        'manage_users',
        'manage_transactions',
        'manage_lottery',
        'view_analytics',
        'manage_settings',
        'assign_moderator_role'
    ],
    super_admin: [
        'manage_admins',
        'manage_system_settings',
        'view_audit_logs',
        'manage_roles',
        'full_access'
    ]
};

export const ROLE_HIERARCHY: { [key in UserRole]: UserRole[] } = {
    super_admin: ['admin', 'finance', 'moderator', 'user'],
    admin: ['finance', 'moderator', 'user'],
    finance: ['user'],
    moderator: ['user'],
    user: []
}; 