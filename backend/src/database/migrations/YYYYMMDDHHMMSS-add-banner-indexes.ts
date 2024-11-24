import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
    await queryInterface.addIndex('banners', ['status']);
    await queryInterface.addIndex('banners', ['priority']);
    await queryInterface.addIndex('banners', ['startDate', 'endDate']);
}

export async function down(queryInterface: QueryInterface) {
    await queryInterface.removeIndex('banners', ['status']);
    await queryInterface.removeIndex('banners', ['priority']);
    await queryInterface.removeIndex('banners', ['startDate', 'endDate']);
} 