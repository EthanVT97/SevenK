"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = void 0;
exports.initializeDatabase = initializeDatabase;
const user_model_1 = __importDefault(require("../models/user.model"));
const bank_account_model_1 = __importDefault(require("../models/bank-account.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const lottery_model_1 = require("../models/lottery.model");
const banner_model_1 = __importDefault(require("../models/banner.model"));
const logger_1 = require("../utils/logger");
async function initializeDatabase() {
    try {
        // Initialize models
        await user_model_1.default.sync();
        await bank_account_model_1.default.sync();
        await transaction_model_1.default.sync();
        await lottery_model_1.Lottery.sync();
        await lottery_model_1.LotteryBet.sync();
        await banner_model_1.default.sync();
        // Set up associations
        user_model_1.default.hasMany(bank_account_model_1.default, { as: 'bankAccounts', foreignKey: 'userId' });
        bank_account_model_1.default.belongsTo(user_model_1.default, { as: 'user', foreignKey: 'userId' });
        user_model_1.default.hasMany(transaction_model_1.default, { as: 'transactions', foreignKey: 'userId' });
        transaction_model_1.default.belongsTo(user_model_1.default, { as: 'user', foreignKey: 'userId' });
        user_model_1.default.hasMany(lottery_model_1.LotteryBet, { as: 'bets', foreignKey: 'userId' });
        lottery_model_1.LotteryBet.belongsTo(user_model_1.default, { as: 'user', foreignKey: 'userId' });
        user_model_1.default.hasMany(user_model_1.default, { as: 'referrals', foreignKey: 'referrerId' });
        user_model_1.default.belongsTo(user_model_1.default, { as: 'referrer', foreignKey: 'referrerId' });
        logger_1.logger.info('Database initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('Database initialization failed:', error);
        throw error;
    }
}
exports.models = {
    User: user_model_1.default,
    BankAccount: bank_account_model_1.default,
    TransactionModel: transaction_model_1.default,
    Lottery: lottery_model_1.Lottery,
    LotteryBet: lottery_model_1.LotteryBet,
    Banner: banner_model_1.default
};
