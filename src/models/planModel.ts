import { DataTypes, Model, Optional } from 'sequelize';
import db from '../config/database';

// Define the Plan attributes
interface PlanAttributes {
    planId: string;
    planName: string;
    planRate: number;
    planDuration: number; // e.g., duration in months
    planDescription?: string; // Optional field for description
}

// Define the optional attributes for creating a Plan
interface PlanCreationAttributes extends Optional<PlanAttributes, 'planId'> {}

// Define the Plan model
class Plan extends Model<PlanAttributes, PlanCreationAttributes> implements PlanAttributes {
    public planId!: string;
    public planName!: string;
    public planRate!: number;
    public planDuration!: number;
    public planDescription?: string;
}

// Initialize the Plan model
Plan.init(
    {
        planId: {
            type: DataTypes.STRING,
            allowNull: false,
            // unique: true,
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
        planDuration: {
            type: DataTypes.INTEGER,
            allowNull: false, // e.g., 1 for 1 month, 12 for a year, etc.
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

export default Plan;
