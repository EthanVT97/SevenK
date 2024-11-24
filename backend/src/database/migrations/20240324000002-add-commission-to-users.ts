import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface, Sequelize: any) => {
        await queryInterface.addColumn('users', 'commission', {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            allowNull: false
        });
    },

    down: async (queryInterface: QueryInterface, Sequelize: any) => {
        await queryInterface.removeColumn('users', 'commission');
    }
}; 