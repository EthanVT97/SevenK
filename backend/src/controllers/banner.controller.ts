import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Banner from '../models/banner.model';
import { logger } from '../utils/logger';

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Admin
export const createBanner = async (req: Request, res: Response) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json({
            message: 'Banner created successfully',
            banner
        });
    } catch (error) {
        logger.error('Create banner error:', error);
        res.status(500).json({
            message: 'Error creating banner',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req: Request, res: Response) => {
    try {
        const currentDate = new Date();
        const banners = await Banner.findAll({
            where: {
                isActive: {
                    [Op.eq]: true
                },
                startDate: {
                    [Op.lte]: currentDate
                },
                endDate: {
                    [Op.gte]: currentDate
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
    } catch (error) {
        logger.error('Get banners error:', error);
        res.status(500).json({
            message: 'Error retrieving banners',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Admin
export const updateBanner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);

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
    } catch (error) {
        logger.error('Update banner error:', error);
        res.status(500).json({
            message: 'Error updating banner',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Admin
export const deleteBanner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);

        if (!banner) {
            return res.status(404).json({
                message: 'Banner not found'
            });
        }

        await banner.destroy();
        res.json({
            message: 'Banner deleted successfully'
        });
    } catch (error) {
        logger.error('Delete banner error:', error);
        res.status(500).json({
            message: 'Error deleting banner',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 