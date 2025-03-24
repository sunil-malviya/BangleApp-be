"use strict";
import express from "express";
const router = express.Router();
import MasterController from "./master.controller.js";
import {
  checkInput,

  showParametersErrors,
} from "./../../../middleware/validator/index.js";



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
router.get("/:id?", 

  // checkInput("organization_id"),
  // showParametersErrors,
  MasterController.getMaster
)


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

router.post("/",

  checkInput("create_master"),
  showParametersErrors,
 MasterController.createMaster);
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


router.put("/:id",

  checkInput("create_master"),
  showParametersErrors,
  MasterController.updateByIdMaster);
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

router.delete("/:id",

  // checkInput("create_master"),
  // showParametersErrors,
  MasterController.deleteByIdMaster);


export default router;
