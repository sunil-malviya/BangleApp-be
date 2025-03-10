`use strict`;
import express from 'express';
const router = express.Router();
import testRoute from './test/index.js'


router.use('/test', testRoute);



/**********************************************/
export default router;
