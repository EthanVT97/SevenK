import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    password: string;
    walletBalance: number;
    status: 'pending' | 'active' | 'suspended' | 'banned';
    lastLogin: Date | null;
}

class User extends Model<UserAttributes> {
    declare id: number;
    declare name: string;
    declare phone: string;
    declare email: string | null;
    declare password: string;
    declare walletBalance: number;
    declare status: 'pending' | 'active' | 'suspended' | 'banned';
    declare lastLogin: Date | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    public async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        walletBalance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM('pending', 'active', 'suspended', 'banned'),
            allowNull: false,
            defaultValue: 'pending',
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
    }
);

export default User; 