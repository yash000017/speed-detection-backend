import { DataTypes, Model, Optional } from 'sequelize';
import db from '../config/database';
import User from './userModel';
import Plan from './planModel';

interface UserPlanAttributes {
    userPlanId: string;
    userId: string;
    planId: string;
    paymentAmount: number;
    paymentGatewayId: string;
    paymentOn: Date;
    isActive: boolean;
    totalBallCount: number; // Add totalBallCount
    currentBallCount: number; // Add currentBallCount
    createdAt?: Date; // Optional createdAt
    updatedAt?: Date; // Optional updatedAt
    planName?: string; // Optional planName
}

interface UserPlanCreationAttributes extends Optional<UserPlanAttributes, 'userPlanId' | 'isActive'> {}

class UserPlan extends Model<UserPlanAttributes, UserPlanCreationAttributes> implements UserPlanAttributes {
    public userPlanId!: string;
    public userId!: string;
    public planId!: string;
    public paymentAmount!: number;
    public paymentGatewayId!: string;
    public paymentOn!: Date;
    public isActive!: boolean;
    public totalBallCount!: number; // Declare totalBallCount
    public currentBallCount!: number; // Declare currentBallCount
    public createdAt!: Date; // Declare createdAt
    public updatedAt!: Date; // Declare updatedAt

    // Add a virtual field for planName
    public get planName(): string {
        return this.getDataValue('planName') || ''; // Return the plan name or an empty string
    }
}

UserPlan.init(
    {
        userPlanId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: User,
                key: 'userId',
            },
        },
        planId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: Plan,
                key: 'planId',
            },
        },
        paymentAmount: {
            type: DataTypes.FLOAT,
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
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        totalBallCount: {
            type: DataTypes.INTEGER,
            allowNull: false, // Assuming this should not be nullable
        },
        currentBallCount: {
            type: DataTypes.INTEGER,
            allowNull: false, // Assuming this should not be nullable
        },
    },
    {
        sequelize: db.sequelize,
        modelName: 'UserPlan',
        tableName: 'user_plans',
        timestamps: true, // Enable timestamps
        // Add hooks to set the plan name based on the associated plan
        defaultScope: {
            include: [{
                model: Plan,
                as: 'plan',
                attributes: ['planName'], // Include the plan name
            }],
        },
        scopes: {
            withPlanName: {
                include: [{
                    model: Plan,
                    as: 'plan',
                    attributes: ['planName'], // Include only plan name if needed
                }],
            },
        },
    }
);

// Associations
UserPlan.belongsTo(Plan, {
    foreignKey: 'planId',
    as: 'plan',
});

Plan.hasMany(UserPlan, {
    foreignKey: 'planId',
    as: 'userPlans',
});


export default UserPlan;
