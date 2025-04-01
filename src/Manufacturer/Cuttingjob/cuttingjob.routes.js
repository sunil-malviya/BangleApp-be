"use strict";
import express from "express";
const router = express.Router();
import CuttingJobController from "./cuttingjob.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "./../../../middleware/validator/index.js";

// Function to disable caching
function disableCache(req, res, next) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  console.log(`[DEBUG] Route accessed: ${req.method} ${req.originalUrl}`);
  console.log(`[DEBUG] About to call controller for ${req.path}`);
  next();
}

// Test endpoint to check if routes are working
router.get("/test-logs", (req, res) => {
  console.log("[TEST ROUTE] Test logs route has been called!");
  console.log("[TEST ROUTE] Request headers:", req.headers);
  return res.status(200).json({
    status: true,
    message: "Test logs route working!",
    data: [{id: 1, name: "Test Pipe Stock"}, {id: 2, name: "Another Test Stock"}]
  });
});

// IMPORTANT: Order matters for routes - most specific first

// Get pipe stocks for cutting job
router.get(
  "/pipe-stocks",
  disableCache,
  (req, res, next) => {
    console.log("[ROUTER CHECK] pipe-stocks route matched!");
    next();
  },
  CuttingJobController.getPipeStocks,
);

// Get naginhas for cutting job
router.get(
  "/naginhas",
  disableCache,
  (req, res, next) => {
    console.log("[ROUTER CHECK] naginhas route matched!");
    next();
  },
  CuttingJobController.getNaginhas
);

// Get stock transactions for a specific stock
router.get(
  "/stock-transactions/:stockId",
  disableCache,
  (req, res, next) => {
    console.log("[ROUTER CHECK] stock-transactions route matched!");
    next();
  },
  CuttingJobController.getStockTransactions
);

// Receive cutting items
router.post(
  "/receive-items",
  checkInput("receive_cutting_items"),
  showParametersErrors,
  CuttingJobController.receiveCuttingItems
);

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

// Get single cutting job by ID - this must come after other GET routes
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

export default router; 