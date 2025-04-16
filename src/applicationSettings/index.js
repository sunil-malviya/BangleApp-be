`use strict`;
import express from 'express';
const router = express.Router();
import tokenvalidate from "./../../middleware/authorization.js";
import applicationSettingsRoutes from './applicationSettings.routes.js';


router.use(tokenvalidate);
/**********************************************/
router.use('/pdf-setting', applicationSettingsRoutes);
/**********************************************/
export default router;
