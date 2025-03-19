import { body, query, param } from "express-validator";
import multer from "multer";

import { SUPPORTED_FORMATS_IMAGE, FILE_SIZE } from "./formValidConfig.js";

const validationRules = {
  baseId: query("id", "Record ID Required!").exists().notEmpty(),
  baseName: body("name", "Name Required!")
    .exists()
    .withMessage("Name Required!")
    .isString()
    .withMessage("Input must be a String")
    .isLength({ min: 3, max: 100 })
    .withMessage("String length must be between 3 and 100 characters."),
  baseMobile: body("mobile_no", "Mobile no Required!").exists().notEmpty(),
  baseEmail: body("email", "Invalid Email!")
    .exists()
    .notEmpty()
    .withMessage("Please enter email.")
    .isEmail()
    .withMessage("Please enter valid email.")
    .normalizeEmail(),
  baseRoleId: body("role_id", "Role ID Required!")
    .exists()
    .notEmpty()
    .isNumeric()
    .withMessage("Role ID Must Be Digit Only."),
  id: query("id", "Record ID Required!").exists().notEmpty(),
  slug: param("slug", "CMS Slug Required!").exists().notEmpty(),
  firstname: body("firstname")
    .exists()
    .notEmpty()
    .withMessage("Firstname is required.")
    .isString()
    .withMessage("Firstname must be a string.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Firstname must be between 3 and 100 characters."),
  lastname: body("lastname", "lastname Required!")
    .exists()
    .withMessage("lastname Required!")
    .isString()
    .withMessage("Input must be a String")
    .isLength({ min: 3, max: 100 })
    .withMessage("String length must be between 3 and 100 characters."),
  gender: body("gender", "Gender Required!").exists().notEmpty(),
  dateofbirth: body("Dob", "Date of Birth Required!").exists().notEmpty(),
  joined_date: body("joined_date", "Joined Date Required!").exists().notEmpty(),
  jobTitle: body("jobTitle", "Job Title Required!").exists().notEmpty(),
  payscale: body("payscale", "Payscale Required!").exists().notEmpty(),
  BankAccount: body("bank_ac", "Bank Account Required!").exists().notEmpty(),
  ID_Proof_Type: body("id_type", "ID Proof Type Required!").exists().notEmpty(),
  ID_Number: body("id_number", "ID Number Required!").exists().notEmpty(),
  employee_id: body("employee_id", "Employee ID Required!").exists().notEmpty(),
  mobile: body("mobile", "Mobile No Required!").exists().notEmpty(),
  otp: body("otp", "OTP Required!").exists().notEmpty(),
  email: body("email", "Invalid Email!")
    .exists()
    .notEmpty()
    .withMessage("Please enter email.")
    .isEmail()
    .withMessage("Please enter valid email.")
    .normalizeEmail(),
  role_id: body("role_id", "Role ID Required!").exists().notEmpty(),
  alt_mobile: body("alt_mobile", "Alternate Mobile No Required!")
    .exists()
    .notEmpty()
    .optional({ checkFalsy: true }),
  password: body("password", "Password Required!").exists().notEmpty(),
  token: body("token", "Token Required!").exists().notEmpty(),
  new_password: body("new_password", "New Password Required!")
    .exists()
    .notEmpty(),
  status: body("status", "Status Required!").exists().isBoolean(),
  country_code: body("country_code", "Country Code Required!")
    .exists()
    .notEmpty()
    .isNumeric()
    .withMessage("Country Code Must Be Digit Only."),
  pincode: body("pincode", "Pincode Required!").exists().notEmpty(),
  year: body("year", "Year Required!").exists().notEmpty(),
  start_date: body("start_date", "Start Date Required!")
    .exists()
    .notEmpty()
    .isDate()
    .withMessage("Please enter a valid date."),
  end_date: body("end_date", "End Date Required!")
    .exists()
    .notEmpty()
    .isDate()
    .withMessage("Please enter a valid date."),
  address: body("address", "Firm Address Required!").exists().notEmpty(),
  date: body("date", "Date Required!").exists().notEmpty(),
  total_employee: body("total_employee", "Total Employee Required!")
    .exists()
    .notEmpty()
    .isNumeric()
    .withMessage("Total Employee must be a number."),
  country: body("country", "Country is Required!").exists().notEmpty(),
  state: body("state", "State is Required!").exists().notEmpty(),
  city: body("city", "City is Required!").exists().notEmpty(),
  is_sundayholiday: body("is_sundayholiday", "Field is Required!")
    .exists()
    .isBoolean()
    .withMessage("Field must be a boolean value."),
  organization_id: body("org_id", "Organization ID Required!")
    .exists()
    .notEmpty(),
  subscription_id: body("subscription_id", "Subscription ID Required!")
    .exists()
    .notEmpty(),
  months: body("months", "Months is Required!")
    .exists()
    .notEmpty()
    .isNumeric()
    .withMessage("Months must be a number."),

  //----------------------------------------------------------------------------//

  sizeFrom: body("sizeFrom").exists().withMessage("field is required"),

  sizeTo: body("sizeTo").exists().withMessage("field is required"),

  colors: body("colors")
    .optional()
    .custom((value, { req }) => {
      if (!Array.isArray(value)) {
        req.body.colors = value.split(",").map((v) => v.trim());
      }

      if (
        !Array.isArray(req.body.colors) ||
        req.body.colors.some((v) => typeof v !== "string")
      ) {
        throw new Error("Color value must be an array of strings.");
      }

      return true;
    }),

  rate: body("rate")
    .exists()
    .withMessage("Rate is required")
    .isFloat({ gt: 0 })
    .withMessage("Rate must be a valid number greater than 0"),

  images: body("images", "You must select an image.")
    .custom((value, { req }) => {
      const files = req.files || (req.file ? [req.file] : []);
      return files.length > 0;
    })
    .withMessage("Please Upload at least one Image File.")
    .custom((value, { req }) => {
      const files = req.files || (req.file ? [req.file] : []);
      return files.every((file) => file.size <= FILE_SIZE);
    })
    .withMessage("Image file size should not exceed 5MB.")
    .custom((value, { req }) => {
      const files = req.files || (req.file ? [req.file] : []);
      return files.every((file) =>
        SUPPORTED_FORMATS_IMAGE.includes(file.mimetype)
      );
    })
    .withMessage("Please Upload Image having Format: jpg, png, and jpeg."),
};

export default validationRules;
