"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('banners', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        imageUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        link: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'inactive'
        },
        priority: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        }
    });
}
async function down(queryInterface) {
    await queryInterface.dropTable('banners');
}
