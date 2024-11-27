"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'commission', {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            allowNull: false
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'commission');
    }
};
