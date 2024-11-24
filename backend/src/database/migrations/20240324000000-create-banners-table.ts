import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface, Sequelize: any) => {
        await queryInterface.createTable('banners', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            imageUrl: {
                type: DataTypes.STRING,
                allowNull: false
            },
            link: {
                type: DataTypes.STRING,
                allowNull: true
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM('active', 'inactive'),
                defaultValue: 'inactive'
            },
            priority: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });
    },

    down: async (queryInterface: QueryInterface, Sequelize: any) => {
        await queryInterface.dropTable('banners');
    }
}; 