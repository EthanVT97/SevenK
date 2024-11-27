"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
// Import the migration modules
const createBannersTable = require('./migrations/20240324000000-create-banners-table');
const addBannerIndexes = require('./migrations/20240324000001-add-banner-indexes');
const addCommissionToUsers = require('./migrations/20240324000002-add-commission-to-users');
const migrations = [
    {
        name: 'create-banners-table',
        up: createBannersTable.up,
        down: createBannersTable.down
    },
    {
        name: 'add-banner-indexes',
        up: addBannerIndexes.up,
        down: addBannerIndexes.down
    },
    {
        name: 'add-commission-to-users',
        up: addCommissionToUsers.up,
        down: addCommissionToUsers.down
    }
];
async function migrate() {
    try {
        // Test database connection first
        await (0, database_1.testConnection)();
        const isUndo = process.argv.includes('undo');
        if (isUndo) {
            // Run migrations in reverse order for undo
            for (const migration of [...migrations].reverse()) {
                logger_1.logger.info(`Reverting migration: ${migration.name}`);
                await migration.down(database_1.sequelize.getQueryInterface());
                logger_1.logger.info(`Successfully reverted migration: ${migration.name}`);
            }
        }
        else {
            // Run migrations in order
            for (const migration of migrations) {
                logger_1.logger.info(`Running migration: ${migration.name}`);
                await migration.up(database_1.sequelize.getQueryInterface());
                logger_1.logger.info(`Successfully completed migration: ${migration.name}`);
            }
        }
        logger_1.logger.info('Migration completed successfully');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Migration failed:', error);
        process.exit(1);
    }
}
migrate();
