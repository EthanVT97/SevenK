import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin' | 'super_admin';
    createdAt?: Date;
    updatedAt?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public role!: 'user' | 'admin' | 'super_admin';
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('user', 'admin', 'super_admin'),
            defaultValue: 'user',
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'users',
    }
);

export default User; 