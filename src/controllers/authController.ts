import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import nodemailer from "nodemailer";
import { CustomRequestAuth } from "../types/express";
import crypto from "crypto"; // For generating OTP
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // Import the utc plugin
import timezone from "dayjs/plugin/timezone"; 
import { Op } from "sequelize";

const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER; // Your email address
const EMAIL_PASS = process.env.EMAIL_PASS; // Your email password or app password

dayjs.extend(utc);
dayjs.extend(timezone);

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Create a token function
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "3d", // Token expiration time
  });
};


export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userName, email, password, age } = req.body;

        // Check if the email already exists
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            res.status(409).json({
                status: "false",
                message: "Email already in use.",
            });
            return;
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create new user with the hashed password
        const newUser = await User.create({
            userName,
            userId: uuidv4(),
            email,
            password: hashedPassword, // Store the hashed password
            age,
            role: "user",
        });

        // Omit the password field from the response data
        const { password: _, ...userWithoutPassword } = newUser.toJSON();

        res.status(201).json({
            status: "true",
            message: "User created successfully",
            data: userWithoutPassword,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            status: "false",
            message: "An error occurred while creating the user.",
        });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, logoutFromOtherDevice } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({
        status: "false",
        message: "Invalid email",
      });
      return;
    }
    
    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        status: "false",
        message: "Invalid password",
      });
      return;
    }

    if (user.currentToken) {
      if (logoutFromOtherDevice === true) {
        user.currentToken = ""; 
        await user.save();
      } else {
        res.status(401).json({
          status: "false",
          message: "User is already logged in on another device. Please log out from the other device to log in here.",
        });
        return;
      }
    }

    // Generate a new token
    const token = generateToken(user.userId);

    // Update the currentToken in the database
    user.currentToken = token;
    await user.save();

    res.status(200).json({
      status: "true",
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while logging in.",
    });
  }
};

export const logoutUser = async (
  req: CustomRequestAuth,
  res: Response
): Promise<void> => {
  try {
    // Check if req.user is defined and has userId
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        status: "false",
        message: "Unauthorized. User not found in request.",
      });
      return;
    }

    const userId = req.user.userId;

    // Find the user by userId
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      res.status(404).json({
        status: "false",
        message: "User not found.",
      });
      return;
    }

    // Clear the currentToken to log out the user
    user.currentToken = null;
    await user.save();

    res.status(200).json({
      status: "true",
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while logging out.",
    });
  }
};

// Controller to handle forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({
        status: "false",
        message: "User not found.",
      });
      return;
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash the OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store the hashed OTP and expiration time in the user's record
    user.resetOtp = hashedOtp;
    user.resetOtpExpires = dayjs().add(10, 'minute').toISOString(); // Set expiration time to 10 minutes from now in ISO format
    await user.save();

    // Send email with the OTP
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Use the OTP below to reset your password:</p>
             <p><strong>${otp}</strong></p>
             <p>This OTP is valid for 10 minutes.</p>`,
    });

    res.status(200).json({
      status: "true",
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while sending the OTP email.",
    });
  }
};

// Controller to handle reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { otp, newPassword } = req.body;
  
  try {
    // Find the user (you may want to change this to find the user based on email or other identifier)
    const user = await User.findOne({ where: { resetOtp: { [Op.ne]: null } } });

    if (!user) {
      res.status(404).json({
        status: "false",
        message: "User not found.",
      });
      return;
    }

    // Check if the OTP is expired
    if (!user.resetOtpExpires || dayjs(user.resetOtpExpires).isBefore(dayjs())) {
      res.status(400).json({
        status: "false",
        message: "OTP has expired. Please request a new one.",
      });
      return;
    }

    // Verify the OTP
    const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isOtpValid) {
      res.status(400).json({
        status: "false",
        message: "Invalid OTP.",
      });
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the OTP fields
    user.password = hashedPassword;
    user.resetOtp = null; // Clear the OTP after use
    user.resetOtpExpires = null; // Clear the expiration time
    await user.save();

    res.status(200).json({
      status: "true",
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      status: "false",
      message: "An error occurred while resetting the password.",
    });
  }
};