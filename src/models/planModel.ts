import { DataTypes, Model, Optional } from 'sequelize';
import db from '../config/database';
import UserPlan from './userPlanModel';

// Define the Plan attributes
interface PlanAttributes {
    planId: string;
    planName: string;
    planRate: number;
    ballCount: number; // New field for ball count
    planDescription?: string; // Optional field for description
}

// Define the optional attributes for creating a Plan
interface PlanCreationAttributes extends Optional<PlanAttributes, 'planId'> {}

// Define the Plan model
class Plan extends Model<PlanAttributes, PlanCreationAttributes> implements PlanAttributes {
    public planId!: string;
    public planName!: string;
    public planRate!: number;
    public ballCount!: number; // Include the new field
    public planDescription?: string;
}

// Initialize the Plan model
Plan.init(
    {
        planId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        planName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        planRate: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        ballCount: {
            type: DataTypes.INTEGER, // New field definition
            allowNull: false, // Make it a required field
        },
        planDescription: {
            type: DataTypes.TEXT,
            allowNull: true, // Optional description of the plan
        },
    },
    {
        sequelize: db.sequelize, // pass the `sequelize` instance
        modelName: 'Plan', // model name
        tableName: 'plans', // specify the table name
    }
);

// Plan.hasMany(UserPlan, {
//     foreignKey: 'planId', // Assuming 'userId' is the foreign key in UserPlan
//     as: 'userPlans', // Alias for the association
// });

export default Plan;
