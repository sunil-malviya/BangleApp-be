"use strict";
import express from "express";
const router = express.Router();
import MasterController from "./master.controller.js";
import {
  checkInput,
  asyncValidate,
  showParametersErrors,
} from "../../../middleware/validator/index.js";


// --------------------------worker route---------------------------------------------

router.get("/worker/online",
  // checkInput("organization_id"),
  // showParametersErrors,
  MasterController.FetchPipemaker
) 
router.get("/worker/:id?",
  // checkInput("organization_id"),
  // showParametersErrors,
  MasterController.getWorkerMaster
)

router.post("/worker/",
  asyncValidate("worker_master"),
  showParametersErrors,
  MasterController.createWorkerMaster
);

router.put("/worker/:id",
  checkInput("worker_master"),
  showParametersErrors,
  MasterController.updateByIdWorkerMaster
);

router.delete("/worker/:id",
  // checkInput("worker_master"),
  // showParametersErrors,
  MasterController.deleteByIdWorkerMaster
);

// --------------------------nagina route---------------------------------------------

router.get("/nagina/:id?",
  // checkInput("organization_id"),
  // showParametersErrors,
  MasterController.getNaginaMaster
)

router.post("/nagina/",
  asyncValidate("nagina_master"),
  showParametersErrors,
  MasterController.createNaginaMaster 
);

router.put("/nagina/:id",
  checkInput("nagina_master"),
  showParametersErrors,
  MasterController.updateByIdNaginaMaster
);

router.delete("/nagina/:id",
  // checkInput("nagina_master"),
  // showParametersErrors,
  MasterController.deleteByIdNaginaMaster
);











export default router;
