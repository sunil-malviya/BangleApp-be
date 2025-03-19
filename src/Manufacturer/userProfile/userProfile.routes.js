"use strict";
import express from "express";
const router = express.Router();
import userProfileController from "./userProfile.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "./../../../middleware/validator/index.js";
import {
  UploadTo,
  deleteFile,
} from "./../../../middleware/validator/Storage.js";
import tokenvalidate from "./../../../middleware/authorization.js";

const uploader = new UploadTo({ dir: "designs", isImage: true, fileSize: 5 });

/**
 * @swagger
 * /user/update/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     description: Update a user profile successfully.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the profile to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the profile
 *               description:
 *                 type: string
 *                 description: profile description
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 1 images
 *     responses:
 *       200:
 *         description: Successfully updated the profile
 *       400:
 *         description: Bad request (invalid input)
 *       401:
 *         description: Unauthorized (invalid or missing JWT token)
 *       404:
 *         description: profile not found
 *       500:
 *         description: Internal server error
 */

router.put(
  "/:id",
  // tokenvalidate, 
  // uploader.array("image", 1), 
  // checkInput("add_design"),
  // showParametersErrors,
  userProfileController.updateUserProfile
);

export default router;
