`use strict`;
import express from 'express';
const router = express.Router();
import AgentTestRoutes from './test/index.js'


router.use('/test', AgentTestRoutes);



/**********************************************/
export default router;
