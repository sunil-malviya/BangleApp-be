`use strict`;
import express from 'express';
const router = express.Router();
import AgentTestRoutes from './test/index.js'
import OptionRoutes from './generatsetting.routes.js'


router.use('/test', AgentTestRoutes);


router.use('/option', OptionRoutes);
/**********************************************/
export default router;
