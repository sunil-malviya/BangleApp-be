`use strict`;
import express from 'express';
const router = express.Router();
import testRoute from './test/index.js'
import designRoute from './Design/design.routes.js'
import userProfileRoute from './userProfile/userProfile.routes.js'


router.use('/test', testRoute);
router.use('/design', designRoute);
router.use('/user/update', userProfileRoute);



/**********************************************/
export default router;
