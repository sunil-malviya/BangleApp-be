"use strict";
import express from "express";
const router = express.Router();
import PipeStockController from "./Pipestock.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "./../../../../middleware/validator/index.js";

router.get(
  "/",


  PipeStockController.getPipestock
);

export default router;
