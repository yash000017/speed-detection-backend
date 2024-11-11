import { Router } from "express";
import {
  createPaymentAndOrder,
  getAllPayments,
  getPayment,
  deletePayment,
  validateOrder,
  upgradePayment,
  reduceBallCount, // Import the reduceBallCount controller
} from "../controllers/userPlanController"; // Make sure to include the correct import path
import { validate } from "../middlewares/validate";
import paymentValidation from "../validators/userPlanValidation"; // You might need to create this
import { authenticateToken } from "../middlewares/authentication";
import authorize from "../middlewares/authorize";

const paymentRouter = Router();

// Create a new payment (requires authentication)
paymentRouter.post("/", authenticateToken, authorize("user"), validate(paymentValidation), createPaymentAndOrder);

// Get all payments (requires authentication, can be limited to certain roles if needed)
paymentRouter.get("/", authenticateToken, authorize("user", "admin"), getAllPayments);

// Get a single payment by ID (requires authentication, can be limited to certain roles if needed)
paymentRouter.get("/:id", authenticateToken, authorize("user", "admin"), getPayment);

// Upgrade an existing payment by ID (requires authentication)
paymentRouter.put("/upgrade/:id", authenticateToken, validate(paymentValidation), upgradePayment);

// Delete a payment by ID (requires authentication)
paymentRouter.delete("/:id", authenticateToken, authorize("user", "admin"), deletePayment);

// Validate Razorpay order (public access)
paymentRouter.post("/validate", validate(paymentValidation), validateOrder);

// Route for reducing ball count (requires authentication)
paymentRouter.post("/reduce-balls/:id", authenticateToken, authorize("user"), reduceBallCount);

export default paymentRouter;
