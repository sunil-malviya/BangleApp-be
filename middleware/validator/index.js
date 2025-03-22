import { validationResult, body, check } from "express-validator";

import * as validationRules from "./rules.js"; // Import all as an object
// import * as asyncValidation from "./asyncValidate.js";



// import languageModule from "../../helpers/languages/index.js"; // Import language module

const {
  baseMobile,
  baseEmail,
  firstname,
  lastname,
  email,
  mobile,
  mobile_no,
  employee_id,
  otp,
  gender,
  dateofbirth,
  pincode,
  role_id,
  Admin_id,
  page_id,
  country_code,
  country_id,
  state_id,
  city_id,
  area_id,
  locality_id,
  totalclient,
  id,
  ID,
  slug,
  password,
  token,
  new_password,
  fullName,
  name,
  status,
  cms_contant,
  verification_img,
  images,
  type,
  title,
  message,
  users,
  meta_description,
  meta_keyword,
  meta_title,
  total_employee,
  country,
  state,
  city,
  is_sundayholiday,
  address,
  start_date,
  end_date,
  organization_id,
  subscription_id,
  mode_of_pay,
  joined_date,
  jobTitle,
  payscale,
  BankAccount,
  ID_Proof_Type,
  baseName,
  rate,
  colors,
  details,
  color,
  sizeTo,
  sizeFrom,
  shopName,
  workerType

} = validationRules.default;


const showParametersErrors = (req, res, next) => {
  const errors = validationResult(req);

  var errJson = errors.errors.filter((row) => row.path)
    .reduce((acc, row) => {
      acc[row.path] = row.msg;
      return acc;
    }, {});

  errJson = { ...errJson, ...req.fileValidationError };
  if (Object.keys(errJson).length) {
    return res.status(422).json({
      status: false,
      message: "REQUIRED_PARAMETER_MISING",
      data: errJson,
    });
  }

  next();
};

const checkInput = (method) => {

  switch (method) {
    case "add_design":
      return [baseName, rate, colors, sizeTo, sizeFrom, images];

    case "organization_id":
      return [organization_id];
      
    case "create_master":
      return [fullName, mobile, shopName, workerType,];

    case "fileUploads":
      return [images];

    default:
      return [];
  }
};

const asyncValidate = (method) => {
  switch (method) {
    case "createClient":
      return [
        name,
        gender,
        mobile_no,
        dateofbirth,
        address,
        jobTitle,
        joined_date,
        payscale,
        BankAccount,
        ID_Proof_Type,
      ];



    default:
      return [];
  }
};

export { checkInput, asyncValidate, showParametersErrors };
