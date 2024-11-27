import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Define attributes interface
interface OTPAttributes {
    id: number;
    phone: string;
    otp: string;
    expiresAt: Date;
    attempts: number;
    lastResendAt: Date;
    isUsed: boolean;
}

// Define creation attributes interface
interface OTPCreationAttributes extends Optional<OTPAttributes, 'id'> { }

// Define the OTP model
class OTP extends Model<OTPAttributes, OTPCreationAttributes> implements OTPAttributes {
    public id!: number;
    public phone!: string;
    public otp!: string;
    public expiresAt!: Date;
    public attempts!: number;
    public lastResendAt!: Date;
    public isUsed!: boolean;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

OTP.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^\+?959\d{7,9}$/
            }
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 5
            }
        },
        lastResendAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        isUsed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        sequelize,
        modelName: 'OTP',
        tableName: 'otps',
        timestamps: true,
        indexes: [
            {
                fields: ['phone', 'expiresAt']
            },
            {
                fields: ['phone', 'isUsed']
            }
        ]
    }
);

export default OTP; 