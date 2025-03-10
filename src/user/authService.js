import axios from "axios";
import Prisma  from '../../db/prisma.js';
import { createToken } from "../../utils/jwtCRUD.js";
import jwt from 'jsonwebtoken'


const users = {}; // Temporary storage (use database in production)

const generateAuthToken = async () => {
  const baseURL = process.env.MESSAGECENTRAL_BASE_URL;
  const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
  const email = process.env.MESSAGECENTRAL_EMAIL;
  const password = process.env.MESSAGECENTRAL_PASSWORD;

  if (!baseURL || !customerId || !email || !password) {
    throw new Error('Missing required environment variables');
  }

  const url = new URL(`${baseURL}/auth/v1/authentication/token`);
  const params = {
    customerId,
    key: Buffer.from(password).toString('base64'),
    scope: 'NEW',
    country: '91', // Mandatory for Indian numbers
    email
  };

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await axios.get(url.toString(), {
      headers: { accept: '*/*' }
    });
    return response.data.token;
  } catch (error) {
    console.error('Auth Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: url.toString()
    });
    throw new Error(`Authentication failed: ${error.response?.data?.error || error.message}`);
  }
};

export const sendOtp = async (req, res) => {
  const { mobile } = req.query;
  const baseURL = process.env.MESSAGECENTRAL_BASE_URL;
  console.log("-------------- send otp service -------------")
 
  if(process.env.DEV_MODE){
    console.log("DEVMODE RES>>>>>>>>>>>>>")
   return res.status(200).json({
      responseCode:200,
      message:'SUCCESS',
    });
  }

  try {
    const authToken = await generateAuthToken();
    
    // Request OTP with correct parameters
    const otpResponse = await axios.post(
      `${baseURL}/verification/v3/send`,
      null,
      {
        params: {
          countryCode: '91',
          flowType: 'SMS',
          mobileNumber: mobile
        },
        headers: { authToken }
      }
    );

    console.log('OTP Response:', otpResponse.data);
    // Store verification data correctly
    users[mobile] = {
      verificationId: otpResponse.data.data.verificationId,
      authToken: authToken,
      timestamp: Date.now()
    };

    res.status(200).json(otpResponse.data);
  } catch (error) {
    console.log('Send OTP Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: `${baseURL}/verification/v3/send`
    });
    res.status(200).json(error.response?.data || {responseCode:506 , message: "FAILURE"} );
  }
};

export const verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;
  const baseURL = process.env.MESSAGECENTRAL_BASE_URL;
//  --------------------------------------------------------------- dev mode--------------------------------------------//
  if(process.env.DEV_MODE){
    console.log("DEV MODE VERYFY OTP>>>>>>>>>>>>>")
    if(process.env.OTP !== otp){
      return res.status(200).json({ 
        success: false, 
        message: 'Invalid verification request' 
      });
    }else{
      let token ="";
      let org = null;
      const user = await Prisma.user.findUnique({
        where: {
          mobile
        }
      });

      if(user){
        org = await Prisma.organization.findFirst({
          where: {
            userId: user.id
          }
        });
        token = await createToken({...user,...org});
      }

      return res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully',
        isUser : user ? true : false,
        user: user? user : null,
        organization: org ? org : null,
        auth: {
          token,
          role: user ? 'ADMIN' : '',
          userId: user ? user.id : null,
          organizationId: org ? org.id : null,
          isAuthenticated: true,
          type: org && org?.orgType ? org.orgType : ''
        }
      });
    }
  }
  // ----------------------------------------------------------------- dev mode close--------------------------------------------------------//
  
  try {
    // Validate stored data
    if (!users[mobile] || !users[mobile].verificationId) {
      return res.status(200).json({ 
        success: false, 
        message: 'Invalid verification request' 
      });
    }

    const { verificationId, authToken } = users[mobile];

    // Correct validation endpoint (GET request)
    const verifyResponse = await axios.get(
      `${baseURL}/verification/v3/validateOtp`,
      {
        params: {
          verificationId,
          code: otp
        },
        headers: { authToken }
      }
    );
  
    let token ="";
    let org = null;
    if (verifyResponse.data.data.verificationStatus === 'VERIFICATION_COMPLETED') {
      const user = await Prisma.user.findUnique({
        where: {
          mobile
        }
      });

      if(user){
        org = await Prisma.organization.findFirst({
          where: {
            userId: user.id
          }
        });
        token = await createToken({...user,...org});
      }

      return res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully',
        isUser : user ? true : false,
        user: user? user : null,
        organization: org ? org : null,
        auth: {
          token,
          role: user ? 'ADMIN' : '',
          userId: user ? user.id : null,
          organizationId: org ? org.id : null,
          isAuthenticated: true,
          type: org && org?.orgType ? org.orgType : ''
        }
      });
    }

    res.status(200).json({ 
      success: false, 
      message: 'Invalid OTP' 
    });

  } catch (error) {
    console.log('Verify OTP Error:', {
      error: error,
    });
   
    res.status(200).json({
      success: false,
      message: error.response?.data?.message || 'Failed to verify OTP'
    });
  }
};

export const registerUserWithOrganization = async (req, res) => {
  try{
    console.log("registerUserWithOrganization______",req.body)
  const userExits = await Prisma.user.findFirst({where:{
    mobile:req.body.mobile
  }})
  if(userExits){
    console.log("user exit error >>>>>>",)
    return res.status(200).json({success:false,message:'user already exits with this mobile number'})
  }
  const result = await Prisma.$transaction(async (prisma) => {
    // Create user
    const user = await prisma.user.create({
      data: {
        mobile: req.body.mobile,
        fullName: req.body.fullName,
        email: req.body.email,
      },
    });

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        orgName: req.body.orgName,
        orgMobile: req.body.orgMobile,
        orgEmail: req.body.orgEmail,
        orgPincode: req.body.orgPincode,
        orgCity: req.body.orgCity,
        orgState: req.body.orgState,
        orgAddress: req.body.orgAddress,
        orgType: req.body.orgType,
        orgGST: req.body.orgGST,
        orgPAN: req.body.orgPAN,
        orgLogo: req.body.orgLogo,
        orgWebsite: req.body.orgWebsite,
        orgAbout: req.body.orgAbout,
        userId: user.id, // Link to the created user
      },
    });

    return { user, organization };
  });

  if (!result || !result.user || !result.organization) {
    return res.sendError('Failed to register user >>>>>>>>>', 500);
  }

  const token = await createToken({ ...result.user, ...result.organization })

  console.log('Generated Token:>>>>>>>>>>>', token);

  // const verified = jwt.verify(token, secret, { complete: true });
  // console.log('Verified Token:', verified);

  const auth = {
    token,
    role: result.user ? 'ADMIN' : 'USER',
    userId: result.user.id,
    organizationId: result.organization.id,
    isAuthenticated: true,
    type: result.organization.orgType,
  }
  
  return res.sendResponse(
    {
      user: result.user,
      organization: result.organization,
      auth: auth
    },
    "Registration successful",
    201
  );
} catch (error) {
  console.log("be registration error >>>>>>",error)
  return res.sendError('Failed to register user', 500);
}
};


