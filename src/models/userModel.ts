import { DataTypes, Model, Optional, HasManyGetAssociationsMixin } from 'sequelize';
import db from '../config/database';
import UserPlan from './userPlanModel';

// Define the User attributes
interface UserAttributes {
    userId: string;
    userName: string;
    email: string;
    password: string;
    age: number;
    role: 'admin' | 'user';
    currentToken?: string | null;
    resetOtp?: string | null;
    resetOtpExpires?: string | null;
    userPlans?: UserPlan[]; // Add userPlans property
    createdAt?: Date;
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
    public resetOtp?: string | null;
    public resetOtpExpires?: string | null;
    public createdAt!: Date;
    
    public readonly userPlans?: UserPlan[];
    // public getUserPlans!: HasManyGetAssociationsMixin<UserPlan>; // Method to get associated UserPlans
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
            allowNull: true,
        },
        resetOtp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        resetOtpExpires: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
    },
    {
        sequelize: db.sequelize,
        modelName: 'User',
        tableName: 'users',
    }
);

// Define associations
User.hasMany(UserPlan, {
    foreignKey: 'userId', // Assuming 'userId' is the foreign key in UserPlan
    as: 'userPlans', // Alias for the association
});

export default User;
