import { validationResult, body, check } from "express-validator";

import * as validationRules from "./rules.js"; // Import all as an object
import {checkMasterExists,checkNaginaMasterExists} from "./asyncValidate.js";




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

  fullName,
  name,

  images,
  
  address,


  organization_id,

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
  workerType,
  size

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
      

    case "fileUploads":
      return [images];

    default:
      return [];
  }
};

const asyncValidate = (method) => {
  switch (method) {
      case "create_master":
        return [fullName, mobile.custom(checkMasterExists)
          .withMessage("Mobile no already in use."),shopName, workerType,];
  
      case "nagina_master":
        return [name, size.custom(checkNaginaMasterExists)
          .withMessage("Size already in use.")];
      
    

    default:
      return [];
  }
};

export { checkInput, asyncValidate, showParametersErrors };
