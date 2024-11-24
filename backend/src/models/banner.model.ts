import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface BannerAttributes {
    id: number;
    title: string;
    imageUrl: string;
    isActive: boolean;
    startDate: Date;
    endDate: Date;
    priority: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class Banner extends Model<BannerAttributes> implements BannerAttributes {
    public id!: number;
    public title!: string;
    public imageUrl!: string;
    public isActive!: boolean;
    public startDate!: Date;
    public endDate!: Date;
    public priority!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Banner.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    },
    {
        sequelize,
        tableName: 'banners',
    }
);

export default Banner; 