import { Request, Response } from "express";
import User from "../models/userModel";
import UserPlan from "../models/userPlanModel";
import Plan from "../models/planModel";
import db from "../config/database";
import { Op } from "sequelize";

// Define the interfaces for the expected data
interface Month {
  month: string;
}

interface MonthlyUserCount {
  month: string;
  userCount: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface PlanWithUserCount {
  planId: string;
  planName: string;
  userCount: number;
}

// Function to generate all months between a start and end date
const generateAllMonths = (start: string, end: string): Month[] => {
  const months: Month[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const monthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    months.push({ month: monthString });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
};

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total user count
    const totalUsers = await User.count({
        where: { role: "user" },
      });

    // Count of users who have subscribed
    const subscribedUsers = await UserPlan.count({
      distinct: true,
      col: "userId",
    });

    // Total revenue calculation
    const totalRevenueData = await UserPlan.findAll({
        attributes: ["paymentAmount"],  
      });

    const totalRevenue = totalRevenueData.reduce((acc, userPlans) => {
      const plan = userPlans?.dataValues?.paymentAmount;
      return acc + (plan || 0);
    }, 0);

    // Plan-wise user distribution including plans with 0 users
    const planWiseUsers = await Plan.findAll({
      attributes: [
        "planId",
        "planName",
        [
          db.Sequelize.fn("COUNT", db.Sequelize.col("UserPlans.userId")),
          "userCount",
        ],
      ],
      include: [
        {
          model: UserPlan,
          as: "userPlans",
          attributes: [],
          required: false,
        },
      ],
      group: ["Plan.planId"],
    });

    // Format the response for plan-wise users
    const formattedPlanWiseUsers: PlanWithUserCount[] = planWiseUsers.map((plan) => ({
      planId: plan.planId,
      planName: plan.planName,
      userCount: Number(plan.get("userCount")) || 0,
    }));

    // Monthly user count for current month and previous 13 months
    const endMonth = new Date();
    const startMonth = new Date(endMonth);
    startMonth.setMonth(endMonth.getMonth() - 12); // Set to 12 months back

    const monthlyUserCount = await User.findAll({
        attributes: [
          [db.Sequelize.fn('DATE_FORMAT', db.Sequelize.col('createdAt'), '%Y-%m'), 'month'],
          [db.Sequelize.fn('COUNT', db.Sequelize.col('userId')), 'userCount'],
        ],
        where: {
          createdAt: {
            [Op.between]: [startMonth, endMonth],
          },
          role: "user", // Only include users with the role "user"
        },
        group: ['month'],
        order: [['month', 'ASC']],
      });
      

    // Format the monthly user counts into a map for easier access
    const monthlyUserMap: Record<string, number> = monthlyUserCount.reduce((acc, user) => {
      const month = user.get('month') as string;
      const userCount = user.get('userCount') as number;
      acc[month] = userCount;
      return acc;
    }, {} as Record<string, number>);

    // Generate all months for the last 14 months
    const allMonths = generateAllMonths(startMonth.toISOString().slice(0, 7), endMonth.toISOString().slice(0, 7));

    // Merge all months with user counts
    const finalMonthlyCounts: MonthlyUserCount[] = allMonths.map(month => ({
      month: month.month,
      userCount: monthlyUserMap[month.month] || 0, // Use 0 if there is no count
    }));

    // Monthly revenue calculation
    const monthlyRevenueData = await UserPlan.findAll({
      attributes: ["paymentAmount", "createdAt"],  
      where: {
        createdAt: {
          [Op.between]: [startMonth, endMonth],
        },
      },
    });

    // Calculate revenue for each month
    const monthlyRevenueMap: Record<string, number> = {};
      for (const userPlan of monthlyRevenueData) {
        const paymentAmount = userPlan.get("paymentAmount") as number;
        const createdAt = userPlan.get("createdAt") as Date;
      
        // Ensure createdAt is defined before using it
        if (createdAt) {
          const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
          monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + (paymentAmount || 0);
        }
      }

    // Generate final monthly revenue counts
    const finalMonthlyRevenue: MonthlyRevenue[] = allMonths.map(month => ({
      month: month.month,
      revenue: monthlyRevenueMap[month.month] || 0, // Use 0 if there is no revenue
    }));

    // Send the response
    res.status(200).json({
      status: "true",
      data: {
        totalUsers,
        subscribedUsers,
        totalRevenue,
        planWiseUsers: formattedPlanWiseUsers,
        monthlyUserCount: finalMonthlyCounts, // Add monthly user counts
        monthlyRevenue: finalMonthlyRevenue, // Add monthly revenue counts
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while fetching dashboard data.",
    });
  }
};
