"use strict";
import express from "express";
const router = express.Router();
import Generalcontroller from "./generalsetting.controller.js";

router.get(
  "/all",

  Generalcontroller.getAllOption
);

export default router;
