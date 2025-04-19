import { body, query } from "express-validator";

export const sendOtpSchema = [
  query("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .isMobilePhone("any")
    .withMessage("Invalid mobile number format") // 'any' allows international numbers
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits")
    .escape()
    .customSanitizer((value) => value.replace(/[^0-9]/g, "")), // Remove non-numeric characters
];

export const verifyOtpSchema = [
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .isMobilePhone("any")
    .withMessage("Invalid mobile number format") // 'any' allows international numbers
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits")
    .escape()
    .customSanitizer((value) => value.replace(/[^0-9]/g, "")), // Remove non-numeric characters

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 4, max: 8 })
    .withMessage("OTP must be 4-8 digits")
    .matches(/^\d+$/)
    .withMessage("OTP must contain only numbers"),
];

export const registerSchema = [
  // User validations
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .isMobilePhone("any")
    .withMessage("Invalid mobile number format")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits")
    .escape()
    .customSanitizer((value) => value.replace(/[^0-9]/g, "")),

  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3-50 characters")
    .escape(),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  // Organization validations
  body("orgName")
    .trim()
    .notEmpty()
    .withMessage("Organization name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Organization name must be between 3-100 characters")
    .escape(),

  body("orgMobile")
    .trim()
    .notEmpty()
    .withMessage("Organization mobile is required")
    .isMobilePhone("any")
    .withMessage("Invalid organization mobile format")
    .isLength({ min: 10, max: 10 })
    .withMessage("Organization mobile must be 10 digits")
    .escape()
    .customSanitizer((value) => value.replace(/[^0-9]/g, "")),

  body("orgType")
    .trim()
    .notEmpty()
    .withMessage("Organization type is required")
    .isIn(["MANUFACTURER", "KARIGAR", "AGENT", "PIPEMAKER"])
    .withMessage("Invalid organization type"),

  body("orgAddress")
    .trim()
    .notEmpty()
    .withMessage("Organization address is required")
    .isLength({ min: 5, max: 255 })
    .withMessage("Address must be between 5-255 characters")
    .escape(),

  body("orgPincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .isPostalCode("IN")
    .withMessage("Invalid Indian pincode")
    .escape(),

  body("orgCity")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .escape(),

  body("orgState")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .escape(),

  // Optional fields
  body("orgEmail").optional().trim().isEmail().withMessage("Invalid organization email"),
  body("orgGST")
  .optional()
  .trim()
  .isLength({ min: 15, max: 15 })
  .withMessage("GST number must be exactly 15 characters"),

body("orgPAN")
  .optional()
  .trim()
  .isLength({ min: 10, max: 10 })
  .withMessage("PAN number must be exactly 10 characters"),

  body("orgLogo")
  .optional()
  .trim()
  .isString() // Add validator
  .withMessage("plz provide correct organization logo image name"),

body("orgWebsite")
  .optional()
  .trim()
  .isURL()
  .withMessage("Invalid website URL"),

body("orgAbout")
  .optional()
  .trim()
  .isString() // Add validator
  .withMessage("plz enter valid about data "),
];

