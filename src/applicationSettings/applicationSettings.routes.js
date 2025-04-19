"use strict";
import express from "express";
const router = express.Router();
import applicationSettingsController from "./applicationSettings.controller.js";

router.get("/pdf",applicationSettingsController.getPDFSettings);
router.post("/pdf",applicationSettingsController.postPDFSettings);
router.put("/pdf",applicationSettingsController.updatePdfSettings);


export default router;
