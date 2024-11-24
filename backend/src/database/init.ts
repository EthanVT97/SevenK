import { sequelize } from '../config/database';
import User from '../models/user.model';
import BankAccount from '../models/bank-account.model';
import TransactionModel from '../models/transaction.model';
import { Lottery, LotteryBet } from '../models/lottery.model';
import Banner from '../models/banner.model';
import { logger } from '../utils/logger';

export async function initializeDatabase() {
    try {
        // Initialize models
        await User.sync();
        await BankAccount.sync();
        await TransactionModel.sync();
        await Lottery.sync();
        await LotteryBet.sync();
        await Banner.sync();

        // Set up associations
        User.hasMany(BankAccount, { as: 'bankAccounts', foreignKey: 'userId' });
        BankAccount.belongsTo(User, { as: 'user', foreignKey: 'userId' });

        User.hasMany(TransactionModel, { as: 'transactions', foreignKey: 'userId' });
        TransactionModel.belongsTo(User, { as: 'user', foreignKey: 'userId' });

        User.hasMany(LotteryBet, { as: 'bets', foreignKey: 'userId' });
        LotteryBet.belongsTo(User, { as: 'user', foreignKey: 'userId' });

        User.hasMany(User, { as: 'referrals', foreignKey: 'referrerId' });
        User.belongsTo(User, { as: 'referrer', foreignKey: 'referrerId' });

        logger.info('Database initialized successfully');
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
}

export const models = {
    User,
    BankAccount,
    TransactionModel,
    Lottery,
    LotteryBet,
    Banner
}; 