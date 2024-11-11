import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Plan from "../models/planModel";
import { Op } from "sequelize";

// Create a new plan
export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planName, planRate, ballCount, planDescription } = req.body; // Updated to include ballCount

    // Create new plan with a generated UUID for planId
    const newPlan = await Plan.create({
      planId: uuidv4(), // Generate a UUID for planId
      planName,
      planRate,
      ballCount, // Include ballCount
      planDescription,
    });

    res.status(201).json({
      status: "true",
      message: "Plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while creating the plan.",
    });
  }
};

// Get a single plan by ID
export const getPlan = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Extract plan ID from the request parameters

  try {
    const plan = await Plan.findOne({ where: { planId: id } });

    if (!plan) {
      res.status(404).json({
        status: "false",
        message: "Plan not found.",
      });
      return;
    }

    res.status(200).json({
      status: "true",
      data: plan,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while fetching the plan.",
    });
  }
};

// Get all plans
export const getAllPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField as string || 'createdAt'; 
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC'; 
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

    const whereClause = Object.keys(filters).reduce((where: any, key: string) => {
      if (filters[key]) {
        where[key] = { [Op.like]: `%${filters[key]}%` }; // Adjust this for partial match
      }
      return where;
    }, {});

    // Fetch the users with pagination, filtering, and sorting
    const { count, rows: allPlans } = await Plan.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortField, sortOrder]], // Sorting by specified field and order
    })

    res.status(200).json({
      status: "true",
      data: allPlans,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while fetching the plans.",
    });
  }
};

// Update an existing plan
export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Extract plan ID from the request parameters
  const { planName, planRate, ballCount, planDescription } = req.body; // Updated to include ballCount

  try {
    const plan = await Plan.findOne({ where: { planId: id } });

    if (!plan) {
      res.status(404).json({
        status: "false",
        message: "Plan not found.",
      });
      return;
    }

    // Update the plan's details
    plan.planName = planName || plan.planName;
    plan.planRate = planRate || plan.planRate;
    plan.ballCount = ballCount || plan.ballCount; // Update ballCount
    plan.planDescription = planDescription || plan.planDescription;

    await plan.save();

    res.status(200).json({
      status: "true",
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while updating the plan.",
    });
  }
};

// Delete a plan by ID
export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Extract plan ID from the request parameters

  try {
    const plan = await Plan.findOne({ where: { planId: id } });

    if (!plan) {
      res.status(404).json({
        status: "false",
        message: "Plan not found.",
      });
      return;
    }

    await plan.destroy();

    res.status(200).json({
      status: "true",
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while deleting the plan.",
    });
  }
};
