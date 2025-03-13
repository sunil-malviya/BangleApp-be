`use strict`;
import express from 'express';
const router = express.Router();
import  {validateRequest}  from '../../utils/fieldValidation.js';
import { sendOtpSchema,verifyOtpSchema,registerSchema } from './authSchema.js';
import { sendOtp,verifyOtp,registerUserWithOrganization } from './authService.js';


router.post('/send-otp', validateRequest(sendOtpSchema), sendOtp);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOtp);
router.post('/register',validateRequest(registerSchema), registerUserWithOrganization);



/**********************************************/
export default router;
