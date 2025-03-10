import { validationResult } from "express-validator";

export const validateRequest = (validations) => {
  return async (req, res, next) => {
    console.log("req.body data>>>",req.body)
    if(req.body && req.body.data){
      req.body={
        ...req.body,
        ...req.body.data
      }
    }
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("----------schema error-------",errors);
      return res.status(200).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }
    next();
  };
}; 
