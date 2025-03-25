`use strict`;
import express from 'express';
const router = express.Router();
import testRoute from './test/index.js'
import designRoute from './Design/design.routes.js'
import userProfileRoute from './userProfile/userProfile.routes.js'
import workerMasterRoute from './workerMaster/workerMaster.routes.js'
import naginaMasterRoute from './naginaMaster/naginaMaster.routes.js'
import pipejobRoute from "./Pipejob/pipejob.routes.js"

import tokenvalidate from "./../../middleware/authorization.js";



router.use(tokenvalidate);

router.use('/test', testRoute);
router.use('/design', designRoute);
router.use('/user', userProfileRoute);
router.use('/worker-master', workerMasterRoute);
router.use('/nagina-master', naginaMasterRoute);
router.use('/pipejob', pipejobRoute);


/**********************************************/
export default router;
