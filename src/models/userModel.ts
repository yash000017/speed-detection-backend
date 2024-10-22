import { DataTypes, Model, Optional } from 'sequelize';
import db from '../config/database';

// Define the User attributes
interface UserAttributes {
    userId: string;
    userName: string;
    email: string;
    password: string;
    age: number;
    role: 'admin' | 'user';
    currentToken?: string | null;
    resetOtp?: string | null; // Add field for storing the hashed OTP
    resetOtpExpires?: string | null; // Change to string for ISO date
}

// Define the optional attributes for creating a User
interface UserCreationAttributes extends Optional<UserAttributes, 'userId' | 'role' | 'currentToken' | 'resetOtp' | 'resetOtpExpires'> {}

// Define the User model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public userId!: string;
    public userName!: string;
    public email!: string;
    public password!: string;
    public age!: number;
    public role!: 'admin' | 'user';
    public currentToken?: string | null;
    public resetOtp?: string | null; // Property to store the hashed OTP
    public resetOtpExpires?: string | null; // Change to string for ISO date
}

// Initialize the User model
User.init(
    {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: false,
            defaultValue: 'user',
        },
        currentToken: {
            type: DataTypes.STRING,
            allowNull: true, // Allow null for users who are not logged in
        },
        resetOtp: {
            type: DataTypes.STRING,
            allowNull: true, // Allow null when no OTP is generated
        },
        resetOtpExpires: {
            type: DataTypes.STRING, // Change to string for ISO date
            allowNull: true, // Allow null when no OTP expiration is set
        },
    },
    {
        sequelize: db.sequelize, // Pass the `sequelize` instance
        modelName: 'User',
        tableName: 'users', // Specify the table name
    }
);

export default User;
