`use strict`;
import express from 'express';
const router = express.Router();
import karigarTestRoute from './test/index.js'


router.use('/test', karigarTestRoute);



/**********************************************/
export default router;
