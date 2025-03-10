'use strict';
import express from 'express';
import {testMen} from './test.service.js'
const router = express.Router();

export default router;

router.get('/', testMen);
