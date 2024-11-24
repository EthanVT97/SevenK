import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { createBanner, getBanners, updateBanner, deleteBanner } from '../controllers/banner.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

// Define proper types for request/response
interface BannerRequest extends Request {
    params: {
        id?: string;
    };
}

// Define the async handler type that works with Express
type AsyncHandler<T = any> = (
    req: BannerRequest,
    res: Response<T>,
    next: NextFunction
) => Promise<void | Response<T>>;

// Create a wrapper that converts async handlers to Express middleware
const asyncHandler = (handler: AsyncHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await handler(req as BannerRequest, res, next);
        } catch (error) {
            next(error);
        }
    };
};

router.route('/')
    .get(asyncHandler(getBanners))
    .post(protect, admin, asyncHandler(createBanner));

router.route('/:id')
    .put(protect, admin, asyncHandler(updateBanner))
    .delete(protect, admin, asyncHandler(deleteBanner));

export default router;