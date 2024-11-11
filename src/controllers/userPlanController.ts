import { Request, Response } from "express";
import crypto from "node:crypto";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import UserPlan from "../models/userPlanModel";
import cron from "node-cron";
import { Op } from "sequelize"; // Ensure Sequelize is imported
import { v4 as uuidv4 } from 'uuid';
import Plan from "../models/planModel";
import dayjs from "dayjs";

dotenv.config();

// Fetch all payments
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const allPayments = await UserPlan.findAll();
    if (!allPayments || allPayments.length === 0) {
      res.status(404).json({
        status: "false",
        message: "No payments found.",
      });
      return;
    }
    res.status(200).json({
      status: "true",
      data: allPayments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while fetching payments.",
    });
  }
};

// Fetch a single payment by user plan ID
export const getPayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const payment = await UserPlan.findOne({ where: { userPlanId: id } });

    if (!payment) {
      res.status(404).json({
        status: "false",
        message: "Payment not found.",
      });
      return;
    }

    res.status(200).json({
      status: "true",
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while fetching the payment.",
    });
  }
};

// Create payment and order, and upgrade the user's plan
// export const createPaymentAndOrder = async (req: Request, res: Response): Promise<void> => {
//     console.log("aaa")
//   const { userId, planId, paymentAmount, startDate, endDate, amount } = req.body;
//     console.log( userId, planId, paymentAmount, startDate, endDate, amount )
//   try {
//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID as string,
//       key_secret: process.env.RAZORPAY_SECRET as string,
//     });

//     // Create Razorpay order
//     const orderOptions = {
//       amount: amount * 100, // Convert to paise
//       currency: "INR", // Use the appropriate currency
//       receipt: `receipt#${userId}`, // Use a unique receipt number
//       notes: {
//         planId: planId,
//       },
//     };

//     const order = await razorpay.orders.create(orderOptions);

//     if (!order) {
//       res.status(500).json({
//         status: "false",
//         message: "Error creating order.",
//       });
//       return;
//     }

//     // Create user payment record with isActive set to true
//     const newPayment = await UserPlan.create({
//       userId,
//       planId,
//       paymentAmount,
//       startDate,
//       endDate,
//       paymentGatewayId: order.id, // Use the order ID as paymentGatewayId
//       paymentOn: new Date(), // Set current date as payment date
//       isActive: true, // Set the payment as active
//     });

//     res.status(201).json({
//       status: "true",
//       message: "Payment created and order processed successfully.",
//       data: { order, newPayment },
//     });
//   } catch (error) {
//     console.error("Error creating payment and order:", error);
//     res.status(500).json({
//       status: "false",
//       message: "An error occurred while creating the payment and order.",
//     });
//   }
// };

export const createPaymentAndOrder = async (req: Request, res: Response): Promise<void> => {
  const { userId, planId, paymentAmount, isActive } = req.body;

  try {
      // Fetch the plan details using the planId
      const plan = await Plan.findOne({ where: { planId } }) as Plan; // Type assertion

      if (!plan) {
          res.status(404).json({
              status: "false",
              message: "Plan not found.",
          });
          return; // Ensure to return after sending a response
      }

      // Check if the user already has an active plan
      const existingActivePlan = await UserPlan.findOne({
          where: {
              userId,
              isActive: true, // Check for active plans
          },
      });

      if (existingActivePlan) {
          res.status(400).json({
              status: "false",
              message: "User already has an active plan and cannot purchase another.",
          });
          return; // Return early to prevent further execution
      }

      const order = { id: uuidv4() }; // Dummy order for now

      // Create user payment record with all necessary fields
      const newPayment = await UserPlan.create({
          userPlanId: uuidv4(),         // Generate a new UUID for userPlanId
          userId,                       // User ID from request body
          planId,                       // Plan ID from request body
          planName: plan.planName,      // Plan name from fetched plan
          paymentAmount,                // Payment amount from request body
          paymentGatewayId: order.id,   // Use the dummy order ID as paymentGatewayId
          paymentOn: new Date(),        // Set paymentOn to current date
          isActive,                     // Active status from request body
          totalBallCount: plan.ballCount, // Set totalBallCount from Plan model
          currentBallCount: plan.ballCount, // Set currentBallCount from Plan model
      });

      res.status(201).json({
          status: "true",
          message: "Payment created and order processed successfully.",
          data: { order, newPayment },
      });
  } catch (error) {
      console.error("Error creating payment and order:", error);
      res.status(500).json({
          status: "false",
          message: "An error occurred while creating the payment and order.",
      });
  }
};

export const upgradePayment = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // User plan ID
    const { planId, paymentAmount } = req.body; // Removed startDate and endDate

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID as string,
        key_secret: process.env.RAZORPAY_SECRET as string,
    });

    try {
        // Find the user's current plan
        const userPlan = await UserPlan.findOne({ where: { userPlanId: id } });

        if (!userPlan) {
            res.status(404).json({
                status: "false",
                message: "User plan not found.",
            });
            return;
        }

        // Fetch the new plan details using the planId
        const newPlan = await Plan.findOne({ where: { planId } });

        if (!newPlan) {
            res.status(404).json({
                status: "false",
                message: "New plan not found.",
            });
            return;
        }

        // Update the user's plan details
        userPlan.planId = planId;
        userPlan.paymentAmount = paymentAmount; // Adjust if necessary
        userPlan.totalBallCount = newPlan.ballCount; // Set totalBallCount from new plan
        userPlan.currentBallCount = newPlan.ballCount; // Set currentBallCount from new plan

        // Create a Razorpay order
        const orderOptions = {
            amount: paymentAmount * 100, // Convert to paise
            currency: "INR", // Use the appropriate currency
            receipt: `receipt#${userPlan.userId}`, // Use a unique receipt number
            notes: {
                planId: planId,
            },
        };

        const order = await razorpay.orders.create(orderOptions);

        if (!order) {
            res.status(500).json({
                status: "false",
                message: "Error creating Razorpay order.",
            });
            return;
        }

        // Save the updated plan
        await userPlan.save();

        res.status(200).json({
            status: "true",
            message: "Plan upgraded and payment initiated successfully.",
            data: {
                userPlan,
                order,
            },
        });
    } catch (error) {
        console.error("Error upgrading plan and creating payment:", error);
        res.status(500).json({
            status: "false",
            message: "An error occurred while upgrading the plan and creating the payment.",
        });
    }
};


// Delete a payment
export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const payment = await UserPlan.findOne({ where: { userPlanId: id } });

    if (!payment) {
      res.status(404).json({
        status: "false",
        message: "Payment not found.",
      });
      return;
    }

    await payment.destroy();

    res.status(200).json({
      status: "true",
      message: "Payment deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while deleting the payment.",
    });
  }
};

// Validate Razorpay order
export const validateOrder = async (req: Request, res: Response): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    const secret = process.env.RAZORPAY_SECRET as string;

    if (!secret) {
      res.status(500).json({
        status: "false",
        message: "RAZORPAY_SECRET not configured.",
      });
      return;
    }

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest("hex");

    if (digest !== razorpay_signature) {
      res.status(400).json({
        status: "false",
        message: "Transaction is not valid.",
      });
      return;
    }

    res.status(200).json({
      status: "true",
      message: "Transaction validated successfully.",
    });
  } catch (error) {
    console.error("Error validating order:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while validating the transaction.",
    });
  }
};

export const reduceBallCount = async (req: Request, res: Response): Promise<void> => {
  const { userPlanId } = req.body; // Get the user plan ID from the request parameters
  console.log("userPlanId",userPlanId)

  try {
      // Find the user's plan using the provided userPlanId
      const userPlan = await UserPlan.findOne({ where: { userPlanId } });
      if (!userPlan) {
          res.status(404).json({
              status: "false",
              message: "User plan not found.",
          });
          return;
      }

      // Check current ball count
      const { currentBallCount } = userPlan; // Get the current ball count

      if (currentBallCount > 0) {
          // Reduce the ball count by 1
          userPlan.currentBallCount -= 1;

          // Check if the ball count reaches zero
          if (userPlan.currentBallCount === 0) {
              userPlan.isActive = false; // Deactivate the plan
          }

          // Save the updated user plan
          await userPlan.save();

          res.status(200).json({
              status: "true",
              message: "Ball count reduced successfully.",
              data: userPlan,
          });
      } else {
          res.status(400).json({
              status: "false",
              message: "No balls left to reduce.",
          });
      }
  } catch (error) {
      console.error("Error reducing ball count:", error);
      res.status(500).json({
          status: "false",
          message: "An error occurred while reducing the ball count.",
      });
  }
};
// Function to deactivate expired payments
// export const deactivateExpiredPayments = async (): Promise<void> => {
//   try {
//       // Deactivate all active payments
//       const updatedPayments = await UserPlan.update(
//           { isActive: false },
//           { where: { isActive: true } } // Update all active payments to inactive
//       );

//       console.log(`${updatedPayments[0]} payments have been deactivated.`);
//   } catch (error) {
//       console.error("Error deactivating payments:", error);
//   }
// };