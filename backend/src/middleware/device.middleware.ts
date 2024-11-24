import { Request, Response, NextFunction } from 'express';
import { deviceService } from '../services/device.service';

export const deviceAware = (req: Request, res: Response, next: NextFunction) => {
    const deviceType = deviceService.detectDevice(req);
    const config = deviceService.getDeviceConfig(req);

    // Add device info to request
    req.deviceInfo = {
        type: deviceType,
        config: config
    };

    // Override response.json to handle device-specific adjustments
    const originalJson = res.json;
    res.json = function (data: any) {
        const adjustedData = deviceService.adjustResponseForDevice(data, deviceType);
        return originalJson.call(this, adjustedData);
    };

    next();
}; 