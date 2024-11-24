import { QueryInterface } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface, Sequelize: any) => {
        await queryInterface.addIndex('banners', ['status']);
        await queryInterface.addIndex('banners', ['priority']);
        await queryInterface.addIndex('banners', ['startDate', 'endDate']);
    },

    down: async (queryInterface: QueryInterface, Sequelize: any) => {
        await queryInterface.removeIndex('banners', ['status']);
        await queryInterface.removeIndex('banners', ['priority']);
        await queryInterface.removeIndex('banners', ['startDate', 'endDate']);
    }
}; 