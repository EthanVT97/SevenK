"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('banners', ['status']);
        await queryInterface.addIndex('banners', ['priority']);
        await queryInterface.addIndex('banners', ['startDate', 'endDate']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('banners', ['status']);
        await queryInterface.removeIndex('banners', ['priority']);
        await queryInterface.removeIndex('banners', ['startDate', 'endDate']);
    }
};
