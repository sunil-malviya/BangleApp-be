`use strict`;
import express from 'express';
const router = express.Router();
import testRoute from './test/index.js'
import orderRoute from './order/order.routes.js'

import tokenvalidate from "./../../middleware/authorization.js";

router.use(tokenvalidate);

router.use('/test', testRoute);
router.use('/order', orderRoute);


/**********************************************/
export default router;
