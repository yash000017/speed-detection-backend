import { Request, Response } from "express";
import User from "../models/userModel";

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
      const allUsers = await User.findAll();
  
      res.status(200).json({
        status: "true",
        data: allUsers,
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
  