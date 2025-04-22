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



router.put(
  "/orderstatus/:id",

  ordercontroller.updatepipemakerstatus
);

router.put(
  "/orderstatus/reject/:id",

  ordercontroller.rejectpipemakerjob
);


router.get(
  "/pipereminder",

  ordercontroller.getPipereminder
);



router.get(
  "/:id",

  ordercontroller.getPipejobs
);



export default router;
