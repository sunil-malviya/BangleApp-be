"use strict";
import express from "express";
const router = express.Router();
import MasterController from "./workeMaster.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "../../../middleware/validator/index.js";



 
router.get("/:id?", 

  // checkInput("organization_id"),
  // showParametersErrors,
  MasterController.getMaster
)




router.post("/",

  asyncValidate("create_master"),
  showParametersErrors,
 MasterController.createMaster);


router.put("/:id",

  checkInput("create_master"),
  showParametersErrors,
  MasterController.updateByIdMaster);

router.delete("/:id",

  // checkInput("create_master"),
  // showParametersErrors,
  MasterController.deleteByIdMaster);


export default router;
