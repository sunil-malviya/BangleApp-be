"use strict";
import express from "express";
const router = express.Router();
import dashboardontroller from "./dashboard.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "./../../../middleware/validator/index.js";

router.get(
  "/",

  dashboardontroller.FetchDashboard
);

router.get(
  "/recentactivity",

  dashboardontroller.FetchRecentActivity
);

export default router;
