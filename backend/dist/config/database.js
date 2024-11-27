"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeModels = exports.testConnection = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
exports.sequelize = new sequelize_1.Sequelize({
    database: 'sevenk',
    username: 'root',
    password: '',
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 3306,
    logging: (msg) => logger_1.logger.debug(msg),
    dialectOptions: {
        connectTimeout: 60000,
        charset: 'utf8mb4'
    }
});
const testConnection = async () => {
    try {
        await exports.sequelize.authenticate();
        logger_1.logger.info('Database connection established successfully');
    }
    catch (error) {
        logger_1.logger.error('Unable to connect to the database:', error);
        throw error;
    }
};
exports.testConnection = testConnection;
const initializeModels = async () => {
    try {
        // Import models
        const { default: UserModel } = await Promise.resolve().then(() => __importStar(require('../models/user.model')));
        const { default: BannerModel } = await Promise.resolve().then(() => __importStar(require('../models/banner.model')));
        // Sync all models
        await exports.sequelize.sync({ alter: true });
        logger_1.logger.info('Models synchronized successfully');
    }
    catch (error) {
        logger_1.logger.error('Error synchronizing models:', error);
        throw error;
    }
};
exports.initializeModels = initializeModels;
