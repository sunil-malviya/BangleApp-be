"use strict";

import express from "express";
const router = express.Router();
import { validateRequest } from "../../utils/fieldValidation.js";
import { sendOtpSchema, verifyOtpSchema, registerSchema } from "./authSchema.js";
import { sendOtp, verifyOtp, registerUserWithOrganization } from "./authService.js";

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication and user registration
 */

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to user
 *     tags: [Authentication]
 *     description: Send an OTP to the user's mobile number.
 *     parameters:
 *       - in: query
 *         name: mobile
 *         schema:
 *           type: string
 *         required: true
 *         example: "1234567890"
 *         description: User's mobile number to receive OTP.
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
router.post("/send-otp", validateRequest(sendOtpSchema), sendOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Authentication]
 *     description: Verify the OTP entered by the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "1234567890"
 *                 description: User's mobile number.
 *               otp:
 *                 type: string
 *                 example: "1472"
 *                 description: OTP received on the phone.
 *             required:
 *               - mobile
 *               - otp
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP or request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/verify-otp", validateRequest(verifyOtpSchema), verifyOtp);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user with organization
 *     tags: [Authentication]
 *     description: Register a new user and associate them with an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *                 description: User's mobile number.
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: OTP for verification.
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: User's full name.
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *                 description: User's email address.
 *               organizationId:
 *                 type: string
 *                 example: "org_12345"
 *                 description: Organization ID to register the user under.
 *             required:
 *               - phone
 *               - otp
 *               - name
 *               - email
 *               - organizationId
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post("/register", validateRequest(registerSchema), registerUserWithOrganization);

/**********************************************/
export default router;
