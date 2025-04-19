"use strict";
import express from "express";
const router = express.Router();
import ordercontroller from "./order.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "./../../../middleware/validator/index.js";

router.get(
  "/",

  ordercontroller.getPipejobs
);

router.get(
  "/:id",

  //   checkInput("add_design"),
  //   showParametersErrors,

  ordercontroller.getPipejobs
);

router.put(
  "/orderstatus/:id",

  ordercontroller.updatepipemakerstatus
);



router.put(
  "/orderstatus/reject/:id",

  ordercontroller.rejectpipemakerjob
);


export default router;
