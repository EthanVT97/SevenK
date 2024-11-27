"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceAware = void 0;
const device_service_1 = require("../services/device.service");
const deviceAware = (req, res, next) => {
    const deviceType = device_service_1.deviceService.detectDevice(req);
    const config = device_service_1.deviceService.getDeviceConfig(req);
    // Add device info to request
    req.deviceInfo = {
        type: deviceType,
        config: config
    };
    // Override response.json to handle device-specific adjustments
    const originalJson = res.json;
    res.json = function (data) {
        const adjustedData = device_service_1.deviceService.adjustResponseForDevice(data, deviceType);
        return originalJson.call(this, adjustedData);
    };
    next();
};
exports.deviceAware = deviceAware;
