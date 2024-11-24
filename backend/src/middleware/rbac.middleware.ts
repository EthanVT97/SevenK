import { Request, Response, NextFunction } from 'express';
import { UserRole, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../types/roles';
import { logger } from '../utils/logger';

type AuthRequest = Request & Required<Pick<Request, 'user'>>;

export const hasRole = (requiredRole: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as AuthRequest).user?.role as UserRole;

        if (!userRole) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        if (userRole === requiredRole ||
            ROLE_HIERARCHY[userRole]?.includes(requiredRole) ||
            userRole === 'super_admin') {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    };
};

export const hasPermission = (requiredPermission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as AuthRequest).user?.role as UserRole;

        if (!userRole) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        // Check if user has the required permission
        const hasDirectPermission = ROLE_PERMISSIONS[userRole]?.includes(requiredPermission);
        const hasInheritedPermission = ROLE_HIERARCHY[userRole]?.some(
            role => ROLE_PERMISSIONS[role]?.includes(requiredPermission)
        );

        if (hasDirectPermission || hasInheritedPermission || userRole === 'super_admin') {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    };
};

export const combinePermissions = (...permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as AuthRequest).user?.role as UserRole;

        if (!userRole) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        const hasAllPermissions = permissions.every(permission => {
            const hasDirectPermission = ROLE_PERMISSIONS[userRole]?.includes(permission);
            const hasInheritedPermission = ROLE_HIERARCHY[userRole]?.some(
                role => ROLE_PERMISSIONS[role]?.includes(permission)
            );
            return hasDirectPermission || hasInheritedPermission || userRole === 'super_admin';
        });

        if (hasAllPermissions) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    };
};

export const logAction = (action: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as AuthRequest).user;
        logger.info(`User ${user.id} (${user.role}) performed action: ${action}`);
        next();
    };
}; 