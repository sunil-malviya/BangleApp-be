// utils/apiResponse.js

class ApiResponse {
    constructor(statusCode, data,success, message = "Success") {
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
      this.success = success;
    }
  }
  
  const responseHandler = (req, res, next) => {
    // Success response handler
    res.sendResponse = (data,success=true, message, statusCode = 200) => {
      const response = new ApiResponse(statusCode, data,success, message);
      return res.status(statusCode).json(response);
    };
  
    // Error response handler (for known operational errors)
    res.sendError = (message, statusCode = 500, errors = []) => {
      const response = new ApiResponse(
        statusCode,
        null,
        message,
        false,
        errors
      );
      return res.status(statusCode).json(response);
    };
  
    next();
  };
  
  
  
  export {
    ApiResponse,
    responseHandler,
  };