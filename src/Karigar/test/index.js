'use strict';
import express from 'express';
import {testKarigar} from './test.service.js'
const router = express.Router();

export default router;

router.get('/', testKarigar);
