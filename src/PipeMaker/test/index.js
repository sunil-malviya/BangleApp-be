'use strict';
import express from 'express';
import {testPipeMaker} from './test.service.js'
const router = express.Router();

export default router;

router.get('/', testPipeMaker);
