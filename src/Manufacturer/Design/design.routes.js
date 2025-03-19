"use strict";
import express from "express";
const router = express.Router();
import DesignController from "./design.controller.js";
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
 * tags:
 *   name: Designs
 *   description: Design management
 */

/**
 * @swagger
 * /manufacturer/design:
 *   get:
 *     summary: Get all designs
 *     tags: [Designs]  # ✅ ADD TAGS TO GROUP ROUTES
 *     description: Retrieve a list of all designs.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of designs
 */
router.get("/",  tokenvalidate,DesignController.getAllDesigns);
/**
 * @swagger
 * /manufacturer/design:
 *   post:
 *     summary: Create a new design
 *     tags: [Designs]
 *     description: Add a new design to the database. Supports multipart form data.
 *     security:
 *       - BearerAuth: []  # Ensures JWT Token input appears in Swagger UI
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the design
 *                 example: "Elegant Sofa"
 *               rate:
 *                 type: number
 *                 description: Rate of the design
 *                 example: 499.99
 *               colorValue:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of color codes or values
 *                 example: ["#FF5733", "#000000", "#FFFFFF"]
 *               details:
 *                 type: string
 *                 description: Additional details about the design
 *                 example: "A premium quality sofa with leather finish."
 *             
 *               sizeTo:
 *                 type: number
 *                 description: Maximum size dimension
 *                 example: 200
 *               sizeFrom:
 *                 type: number
 *                 description: Minimum size dimension
 *                 example: 100
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Upload a design file (image, document, etc.)
 *     responses:
 *       200:
 *         description: Successfully created a new design
 *       401:
 *         description: Unauthorized (Invalid or missing JWT token)
 *       422:
 *         description: Bad request (missing or invalid fields)
 */

router.post(
  "/",
  uploader.array("images", 4),
  checkInput("add_design"),
  showParametersErrors,
  tokenvalidate,
  DesignController.createDesign
);

/**
 * @swagger
 * /manufacturer/design/{id}:
 *   get:
 *     summary: Get a design by ID
 *     tags: [Designs]
 *     description: Retrieve a specific design using its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the design to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the design
 *       404:
 *         description: Design not found
 */
router.get("/:id", DesignController.getDesignById);

/**
 * @swagger
 * /manufacturer/design/{id}:
 *   put:
 *     summary: Update a design
 *     tags: [Designs]
 *     description: Modify an existing design.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the design to update
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
 *                 description: Name of the design
 *                 example: "Elegant Sofa"
 *               rate:
 *                 type: number
 *                 format: float
 *                 description: Rate of the design
 *                 example: 499.99
 *               colorValue:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of color codes or values
 *                 example: ["#FF5733", "#000000", "#FFFFFF"]
 *               details:
 *                 type: string
 *                 description: Additional details about the design
 *                 example: "A premium quality sofa with leather finish."
 *               sizeTo:
 *                 type: integer
 *                 description: Maximum size dimension (in cm)
 *                 example: 200
 *               sizeFrom:
 *                 type: integer
 *                 description: Minimum size dimension (in cm)
 *                 example: 100
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Upload a design file (image, document, etc.)
 *     responses:
 *       200:
 *         description: Successfully updated the design
 *       400:
 *         description: Bad request (missing or invalid fields)
 *       401:
 *         description: Unauthorized (Invalid or missing JWT token)
 *       404:
 *         description: Design not found
 *       500:
 *         description: Internal server error
 */

router.put("/:id",uploader.array("image", 4),
checkInput("add_design"),
showParametersErrors,
tokenvalidate, DesignController.updateDesign);
/**
 * @swagger
 * /manufacturer/design/{id}:
 *   delete:
 *     summary: Delete a design
 *     tags: 
 *       - Designs
 *     description: Remove a design from the database.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the design to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the design
 *       400:
 *         description: Bad request (invalid ID format)
 *       401:
 *         description: Unauthorized (invalid or missing JWT token)
 *       404:
 *         description: Design not found
 *       500:
 *         description: Internal server error
 */

router.delete("/:id", DesignController.deleteDesign);

export default router;
