'use strict';
import express from 'express';
import {agentTest} from './test.service.js'
const router = express.Router();

export default router;

router.get('/', agentTest);
