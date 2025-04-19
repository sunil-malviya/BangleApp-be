`use strict`;
import express from "express";
const router = express.Router();
import testRoute from "./test/index.js";
import designRoute from "./Design/design.routes.js";
import userProfileRoute from "./userProfile/userProfile.routes.js";
import masterRoute from "./master/master.routes.js";
import pipejobRoute from "./Pipejob/pipejob.routes.js";
import PipeStockRoute from "./stock/Pipestock/Pipestock.routes.js";
// import CuttingStockRoute from "./stock/Cuttingstock/Cuttingstock.routes.js";
import cuttingjobRoute from "./Cuttingjob/cuttingjob.routes.js";

import tokenvalidate from "./../../middleware/authorization.js";

router.use(tokenvalidate);

router.use("/test", testRoute);
router.use("/design", designRoute);
router.use("/user", userProfileRoute);
router.use("/master", masterRoute);
router.use("/pipejob", pipejobRoute);
router.use('/cuttingjob', cuttingjobRoute);
router.use("/stock/pipe", PipeStockRoute);
// router.use("/stock/cutting", CuttingStockRoute);

/**********************************************/

export default router;
