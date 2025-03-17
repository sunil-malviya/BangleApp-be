`use strict`;
import express from 'express';
const router = express.Router();
import testRoute from './test/index.js'
import designRoute from './design/design.routes.js'


router.use('/test', testRoute);
router.use('/design', designRoute);



/**********************************************/
export default router;
