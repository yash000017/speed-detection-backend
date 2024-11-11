import { Request, Response } from "express";
import User from "../models/userModel";
import UserPlan from "../models/userPlanModel";
import { Op } from 'sequelize'; // Import Sequelize operators

export const getUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Extract user ID from the request parameters
  
    try {
      const user = await User.findOne({ where: { userId: id } });
  
      if (!user) {
        res.status(404).json({
          status: "false",
          message: "User not found.",
        });
        return;
      }
  
      res.status(200).json({
        status: "true",
        data: user,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        status: "false",
        message: "An error occurred while fetching the user.",
      });
    }
  };
  
  

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField as string || 'createdAt'; // Default sort field
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC'; // Default sort order is 'ASC'
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {}; // Assume filters is a JSON string

    // Build the where clause for filtering
    const whereClause = Object.keys(filters).reduce((where: any, key: string) => {
      if (filters[key]) {
        where[key] = { [Op.like]: `%${filters[key]}%` }; // Adjust this for partial match
      }
      return where;
    }, {});

    whereClause['role'] = 'user';

    // Fetch the users with pagination, filtering, and sorting
    const { count, rows: allUsers } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortField, sortOrder]], // Sorting by specified field and order
      include: [
        {
          model: UserPlan,
          as: 'userPlans',
        },
      ],
    });

    res.status(200).json({
      status: "true",
      data: allUsers,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while fetching the users.",
    });
  }
};
  
  

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Extract user ID from the request parameters
  
    try {
      const user = await User.findOne({ where: { userId: id } });
  
      if (!user) {
        res.status(404).json({
          status: "false",
          message: "User not found.",
        });
        return;
      }
  
      await user.destroy();
  
      res.status(200).json({
        status: "true",
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        status: "false",
        message: "An error occurred while deleting the user.",
      });
    }
  };
  