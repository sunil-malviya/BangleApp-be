"use strict";
import express from "express";
const router = express.Router();
import CuttingJobController from "./cuttingjob.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "./../../../middleware/validator/index.js";

// Create new cutting job
router.post(
  "/",
  checkInput("create_cutting_job"),
  showParametersErrors,
  CuttingJobController.createCuttingJob
);

// Get all cutting jobs with filters
router.get(
  "/",
  CuttingJobController.getCuttingJobs
);

// Get single cutting job by ID
router.get(
  "/:id",
  CuttingJobController.getCuttingJobById
);

// Update cutting job
router.put(
  "/:id",
  checkInput("update_cutting_job"),
  showParametersErrors,
  CuttingJobController.updateCuttingJob
);

// Delete cutting jobs
router.delete(
  "/",
  CuttingJobController.deleteCuttingJobs
);

// Receive cutting items
router.post(
  "/receive",
  checkInput("receive_cutting_items"),
  showParametersErrors,
  CuttingJobController.receiveCuttingItems
);

// Get pipe stocks for cutting job
router.get(
  "/pipe-stocks",
  CuttingJobController.getPipeStocks
);

// Get naginhas for cutting job
router.get(
  "/naginhas",
  CuttingJobController.getNaginhas
);

export default router; 