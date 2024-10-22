import { DataTypes, Model, Optional } from 'sequelize';
import db from '../config/database';
import User from './userModel';
import Plan from './planModel';

// Define the UserPlan attributes
interface UserPlanAttributes {
    userPlanId: string;
    userId: string; // Foreign key
    planId: string; // Foreign key
    startDate: Date;
    endDate: Date;
    paymentGatewayId: string;
    paymentOn: Date;
}

// Define the optional attributes for creating a UserPlan
interface UserPlanCreationAttributes extends Optional<UserPlanAttributes, 'userPlanId'> {}

// Define the UserPlan model
class UserPlan extends Model<UserPlanAttributes, UserPlanCreationAttributes> implements UserPlanAttributes {
    public userPlanId!: string;
    public userId!: string;
    public planId!: string;
    public startDate!: Date;
    public endDate!: Date;
    public paymentGatewayId!: string;
    public paymentOn!: Date;
}

// Initialize the UserPlan model
UserPlan.init(
    {
        userPlanId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: User, // Reference to the User model
                key: 'userId', // Foreign key in the User model
            },
        },
        planId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: Plan, // Reference to the Plan model
                key: 'planId', // Foreign key in the Plan model
            },
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        paymentGatewayId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentOn: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize: db.sequelize, // pass the `sequelize` instance
        modelName: 'UserPlan', // model name
        tableName: 'user_plans', // specify the table name
    }
);

export default UserPlan;
