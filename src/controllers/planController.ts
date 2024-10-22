import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Plan from "../models/planModel";

// Create a new plan
export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planName, planRate, planDuration, planDescription } = req.body;

    // Create new plan with a generated UUID for planId
    const newPlan = await Plan.create({
      planId: uuidv4(), // Generate a UUID for planId
      planName,
      planRate,
      planDuration,
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
    const allPlans = await Plan.findAll();

    res.status(200).json({
      status: "true",
      data: allPlans,
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
  const { planName, planRate, planDuration, planDescription } = req.body;

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
    plan.planDuration = planDuration || plan.planDuration;
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
