"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
const banner_routes_1 = __importDefault(require("./routes/banner.routes"));
const PORT = process.env.PORT || 5000;
app_1.app.use('/api/banners', banner_routes_1.default);
app_1.app.listen(PORT, () => {
    logger_1.logger.info(`Server is running on port ${PORT}`);
});
