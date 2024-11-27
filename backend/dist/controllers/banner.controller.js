"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBanner = exports.updateBanner = exports.getBanners = exports.createBanner = void 0;
const sequelize_1 = require("sequelize");
const banner_model_1 = __importDefault(require("../models/banner.model"));
const logger_1 = require("../utils/logger");
// @desc    Create a new banner
// @route   POST /api/banners
// @access  Admin
const createBanner = async (req, res) => {
    try {
        const banner = await banner_model_1.default.create(req.body);
        res.status(201).json({
            message: 'Banner created successfully',
            banner
        });
    }
    catch (error) {
        logger_1.logger.error('Create banner error:', error);
        res.status(500).json({
            message: 'Error creating banner',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createBanner = createBanner;
// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
    try {
        const currentDate = new Date();
        const banners = await banner_model_1.default.findAll({
            where: {
                isActive: {
                    [sequelize_1.Op.eq]: true
                },
                startDate: {
                    [sequelize_1.Op.lte]: currentDate
                },
                endDate: {
                    [sequelize_1.Op.gte]: currentDate
                }
            },
            order: [
                ['priority', 'DESC'],
                ['createdAt', 'DESC']
            ]
        });
        res.json({
            message: 'Banners retrieved successfully',
            banners
        });
    }
    catch (error) {
        logger_1.logger.error('Get banners error:', error);
        res.status(500).json({
            message: 'Error retrieving banners',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getBanners = getBanners;
// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Admin
const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await banner_model_1.default.findByPk(id);
        if (!banner) {
            return res.status(404).json({
                message: 'Banner not found'
            });
        }
        await banner.update(req.body);
        res.json({
            message: 'Banner updated successfully',
            banner
        });
    }
    catch (error) {
        logger_1.logger.error('Update banner error:', error);
        res.status(500).json({
            message: 'Error updating banner',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateBanner = updateBanner;
// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Admin
const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await banner_model_1.default.findByPk(id);
        if (!banner) {
            return res.status(404).json({
                message: 'Banner not found'
            });
        }
        await banner.destroy();
        res.json({
            message: 'Banner deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete banner error:', error);
        res.status(500).json({
            message: 'Error deleting banner',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deleteBanner = deleteBanner;
