"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(queryInterface) {
    await queryInterface.addIndex('banners', ['status']);
    await queryInterface.addIndex('banners', ['priority']);
    await queryInterface.addIndex('banners', ['startDate', 'endDate']);
}
async function down(queryInterface) {
    await queryInterface.removeIndex('banners', ['status']);
    await queryInterface.removeIndex('banners', ['priority']);
    await queryInterface.removeIndex('banners', ['startDate', 'endDate']);
}
