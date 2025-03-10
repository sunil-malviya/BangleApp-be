`use strict`;
import express from 'express';
const router = express.Router();
import  {upload}  from '../../middleware/upload.js';
import { uploadImage, deleteImage } from './upload.service.js'



router.post('/image-upload?', upload.single('image'), uploadImage);
router.delete('/image-delete/:designation/:filename', deleteImage);

/**********************************************/
export default router;
