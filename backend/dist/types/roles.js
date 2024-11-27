"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_HIERARCHY = exports.ROLE_PERMISSIONS = void 0;
exports.ROLE_PERMISSIONS = {
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
exports.ROLE_HIERARCHY = {
    super_admin: ['admin', 'finance', 'moderator', 'user'],
    admin: ['finance', 'moderator', 'user'],
    finance: ['user'],
    moderator: ['user'],
    user: []
};
