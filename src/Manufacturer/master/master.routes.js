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

// Define the new route for fetching online Karigars
router.get("/online-karigar", MasterController.FetchKarigar);

// --------------------------cutting sample routes---------------------------------------------

router.get("/cutting-sample/detail/:id", 
  MasterController.getCuttingSampleById
);

router.get("/cutting-sample/:id?", 
  MasterController.getCuttingSamples
);

router.post("/cutting-sample/", 
  // For validation you may add: asyncValidate("cutting_sample"),
  showParametersErrors,
  MasterController.createCuttingSample
);

router.put("/cutting-sample/:id", 
  // For validation you may add: checkInput("cutting_sample"),
  showParametersErrors,
  MasterController.updateCuttingSampleById
);

router.delete("/cutting-sample/:id", 
  MasterController.deleteCuttingSampleById
);

router.post("/cutting-sample/bulk-delete", 
  MasterController.bulkDeleteCuttingSamples
);

export default router;
