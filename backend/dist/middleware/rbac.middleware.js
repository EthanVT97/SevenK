"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAction = exports.combinePermissions = exports.hasPermission = exports.hasRole = void 0;
const roles_1 = require("../types/roles");
const logger_1 = require("../utils/logger");
const hasRole = (requiredRole) => {
    return (req, res, next) => {
        var _a, _b;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!userRole) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        if (userRole === requiredRole ||
            ((_b = roles_1.ROLE_HIERARCHY[userRole]) === null || _b === void 0 ? void 0 : _b.includes(requiredRole)) ||
            userRole === 'super_admin') {
            next();
        }
        else {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    };
};
exports.hasRole = hasRole;
const hasPermission = (requiredPermission) => {
    return (req, res, next) => {
        var _a, _b, _c;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!userRole) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        // Check if user has the required permission
        const hasDirectPermission = (_b = roles_1.ROLE_PERMISSIONS[userRole]) === null || _b === void 0 ? void 0 : _b.includes(requiredPermission);
        const hasInheritedPermission = (_c = roles_1.ROLE_HIERARCHY[userRole]) === null || _c === void 0 ? void 0 : _c.some(role => { var _a; return (_a = roles_1.ROLE_PERMISSIONS[role]) === null || _a === void 0 ? void 0 : _a.includes(requiredPermission); });
        if (hasDirectPermission || hasInheritedPermission || userRole === 'super_admin') {
            next();
        }
        else {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    };
};
exports.hasPermission = hasPermission;
const combinePermissions = (...permissions) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!userRole) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        const hasAllPermissions = permissions.every(permission => {
            var _a, _b;
            const hasDirectPermission = (_a = roles_1.ROLE_PERMISSIONS[userRole]) === null || _a === void 0 ? void 0 : _a.includes(permission);
            const hasInheritedPermission = (_b = roles_1.ROLE_HIERARCHY[userRole]) === null || _b === void 0 ? void 0 : _b.some(role => { var _a; return (_a = roles_1.ROLE_PERMISSIONS[role]) === null || _a === void 0 ? void 0 : _a.includes(permission); });
            return hasDirectPermission || hasInheritedPermission || userRole === 'super_admin';
        });
        if (hasAllPermissions) {
            next();
        }
        else {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    };
};
exports.combinePermissions = combinePermissions;
const logAction = (action) => {
    return (req, res, next) => {
        const user = req.user;
        logger_1.logger.info(`User ${user.id} (${user.role}) performed action: ${action}`);
        next();
    };
};
exports.logAction = logAction;
