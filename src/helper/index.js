`use strict`;
import express from 'express';
const router = express.Router();
import { upload, handleMulterError } from '../../middleware/upload.js';
import { uploadImage, deleteImage } from './upload.service.js';

// Use error handling middleware after upload
router.post('/image-upload', upload.single('image'), handleMulterError, uploadImage);
router.delete('/image-delete/:designation/:filename', deleteImage);

/**********************************************/
export default router;
