import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

interface UserAttributes {
    id: number;
    name: string;
    phone: string;
    email?: string;
    password: string;
    walletBalance: number;
    status: 'active' | 'inactive' | 'suspended';
    lastLogin?: Date;
    loginAttempts: number;
    resetToken?: string;
    resetTokenExpiry?: Date;
}

class User extends Model<UserAttributes> {
    public id!: number;
    public name!: string;
    public phone!: string;
    public email?: string;
    public password!: string;
    public walletBalance!: number;
    public status!: 'active' | 'inactive' | 'suspended';
    public lastLogin?: Date;
    public loginAttempts!: number;
    public resetToken?: string;
    public resetTokenExpiry?: Date;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Helper method to validate password
    public async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
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
            validate: {
                is: /^\+?959\d{7,9}$/
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        walletBalance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            allowNull: false,
            defaultValue: 'active'
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        loginAttempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        resetToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        resetTokenExpiry: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeSave: async (user: User) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        },
        indexes: [
            {
                unique: true,
                fields: ['phone']
            },
            {
                unique: true,
                fields: ['email']
            }
        ]
    }
);

export default User; 