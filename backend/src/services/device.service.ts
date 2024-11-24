import { Request } from 'express';
import { logger } from '../utils/logger';

type DeviceType = 'mobile' | 'tablet' | 'desktop';
type ImageSize = 'small' | 'medium' | 'large';

interface DeviceConfig {
    type: DeviceType;
    maxImageSize: number;
    imageQuality: number;
    batchSize: number;
    supportedImageFormats: string[];
}

class DeviceService {
    private deviceConfigs: Record<DeviceType, DeviceConfig> = {
        mobile: {
            type: 'mobile',
            maxImageSize: 800, // 800px max dimension
            imageQuality: 70,  // 70% quality
            batchSize: 10,     // Items per page
            supportedImageFormats: ['webp', 'jpeg']
        },
        tablet: {
            type: 'tablet',
            maxImageSize: 1200,
            imageQuality: 80,
            batchSize: 15,
            supportedImageFormats: ['webp', 'jpeg', 'png']
        },
        desktop: {
            type: 'desktop',
            maxImageSize: 1600,
            imageQuality: 90,
            batchSize: 20,
            supportedImageFormats: ['webp', 'jpeg', 'png', 'gif']
        }
    };

    detectDevice(req: Request): DeviceType {
        const userAgent = req.headers['user-agent']?.toLowerCase() || '';

        // Check for mobile devices
        if (/mobile|android|iphone|ipad|ipod|windows phone/i.test(userAgent)) {
            // Differentiate between tablets and phones
            if (/ipad|tablet/i.test(userAgent)) {
                return 'tablet';
            }
            return 'mobile';
        }

        return 'desktop';
    }

    getDeviceConfig(req: Request): DeviceConfig {
        const deviceType = this.detectDevice(req);
        return this.deviceConfigs[deviceType];
    }

    getImageSize(deviceType: DeviceType, originalSize: number): ImageSize {
        const config = this.deviceConfigs[deviceType];

        if (originalSize <= config.maxImageSize / 2) {
            return 'small';
        } else if (originalSize <= config.maxImageSize) {
            return 'medium';
        }
        return 'large';
    }

    getBatchSize(deviceType: DeviceType): number {
        return this.deviceConfigs[deviceType].batchSize;
    }

    getOptimalImageFormat(req: Request): string {
        const deviceType = this.detectDevice(req);
        const acceptHeader = req.headers.accept || '';
        const config = this.deviceConfigs[deviceType];

        // Check if WebP is supported
        if (acceptHeader.includes('image/webp') && config.supportedImageFormats.includes('webp')) {
            return 'webp';
        }

        // Fallback to JPEG
        return 'jpeg';
    }

    adjustResponseForDevice(data: any, deviceType: DeviceType): any {
        const config = this.deviceConfigs[deviceType];

        // Adjust data based on device capabilities
        if (Array.isArray(data)) {
            return data.slice(0, config.batchSize);
        }

        // Handle nested image URLs
        if (data && typeof data === 'object') {
            return this.processObjectForDevice(data, config);
        }

        return data;
    }

    private processObjectForDevice(obj: any, config: DeviceConfig): any {
        const processed = { ...obj };

        for (const key in processed) {
            if (typeof processed[key] === 'string' && this.isImageUrl(processed[key])) {
                processed[key] = this.getOptimizedImageUrl(processed[key], config);
            } else if (typeof processed[key] === 'object') {
                processed[key] = this.processObjectForDevice(processed[key], config);
            }
        }

        return processed;
    }

    private isImageUrl(url: string): boolean {
        return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
    }

    private getOptimizedImageUrl(url: string, config: DeviceConfig): string {
        // Add image optimization parameters to URL
        const optimizedUrl = new URL(url);
        optimizedUrl.searchParams.set('width', config.maxImageSize.toString());
        optimizedUrl.searchParams.set('quality', config.imageQuality.toString());
        return optimizedUrl.toString();
    }
}

export const deviceService = new DeviceService(); 