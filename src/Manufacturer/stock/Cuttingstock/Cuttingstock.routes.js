"use strict";
import express from "express";
const router = express.Router();
import CuttingStockController from "./Cuttingstock.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "./../../../../middleware/validator/index.js";

// Get all cutting stocks with filtering options
router.get(
  "/",
  CuttingStockController.getCuttingStocks
);

// Get a single cutting stock by ID
router.get(
  "/:id",
  CuttingStockController.getCuttingStockById
);

// Get transactions for a specific cutting stock
router.get(
  "/:id/transactions",
  CuttingStockController.getStockTransactions
);

// Add new cutting stock manually
router.post(
  "/",
  checkInput("add_cutting_stock"),
  showParametersErrors,
  CuttingStockController.addCuttingStock
);

// Update cutting stock quantity
router.put(
  "/:id",
  checkInput("update_cutting_stock"),
  showParametersErrors,
  CuttingStockController.updateCuttingStock
);

// Add a stock transaction (inward or outward)
router.post(
  "/:id/transaction",
  checkInput("add_stock_transaction"),
  showParametersErrors,
  CuttingStockController.addStockTransaction
);

export default router; 