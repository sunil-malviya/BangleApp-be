"use strict";
import express from "express";
const router = express.Router();
import NaginaMasterController from "./naginaMaster.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "./../../../middleware/validator/index.js";



 
router.get("/:id?", 

  // checkInput("organization_id"),
  // showParametersErrors,
  NaginaMasterController.getMaster
)




router.post("/",

  // asyncValidate("nagina_master"),
  // showParametersErrors,
 NaginaMasterController.createNaginaMaster);


router.put("/:id",

  checkInput("create_master"),
  showParametersErrors,
  NaginaMasterController.updateByIdMaster);

router.delete("/:id",

  // checkInput("create_master"),
  // showParametersErrors,
  NaginaMasterController.deleteByIdMaster);


export default router;
