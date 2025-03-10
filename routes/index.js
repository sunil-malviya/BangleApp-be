// routes/index.js (ESM)

import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Welcome to Bangle App' });
});

export default router;
