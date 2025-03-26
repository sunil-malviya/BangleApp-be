"use strict";
import express from "express";
const router = express.Router();
import Pipecontroller from "./pipejob.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "./../../../middleware/validator/index.js";





router.post(
  "/",

//   checkInput("add_design"),
//   showParametersErrors,

  Pipecontroller.createPipejob
);




router.get(
  "/",

//   checkInput("add_design"),
//   showParametersErrors,

  Pipecontroller.getPipejobs
);

router.get(
  "/:id",

//   checkInput("add_design"),
//   showParametersErrors,

  Pipecontroller.getPipejobbyId
);




export default router;
