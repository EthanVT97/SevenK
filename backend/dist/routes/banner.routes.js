"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banner_controller_1 = require("../controllers/banner.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Create a wrapper that converts async handlers to Express middleware
const asyncHandler = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            next(error);
        }
    };
};
router.route('/')
    .get(asyncHandler(banner_controller_1.getBanners))
    .post(auth_middleware_1.protect, auth_middleware_1.admin, asyncHandler(banner_controller_1.createBanner));
router.route('/:id')
    .put(auth_middleware_1.protect, auth_middleware_1.admin, asyncHandler(banner_controller_1.updateBanner))
    .delete(auth_middleware_1.protect, auth_middleware_1.admin, asyncHandler(banner_controller_1.deleteBanner));
exports.default = router;
