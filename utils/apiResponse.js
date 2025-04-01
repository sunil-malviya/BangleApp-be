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
    // Add a 'success' method to res object for consistent API responses
    res.success = (data, message = "Success") => {
      console.log("[DEBUG RESPONSE] Sending success response");
      console.log("[DEBUG RESPONSE] Data length:", Array.isArray(data) ? data.length : "N/A");
      return res.status(200).json({
        status: true,
        message,
        data
      });
    };

    // Add an 'error' method to res object for consistent error responses
    res.someThingWentWrong = (error, message = "Something went wrong") => {
      console.log("[DEBUG RESPONSE] Sending error response:", message);
      console.log("[DEBUG RESPONSE] Error:", error?.message || "Unknown error");
      return res.status(500).json({
        status: false,
        message,
        error: error?.message || "Unknown error"
      });
    };
    
    // Success response handler
    res.sendResponse = (data,success=true, message, statusCode = 200) => {
      console.log("[DEBUG] Sending response with data:");
      const response = new ApiResponse(statusCode, data, success, message);
      return res.status(statusCode).json(response);
    };
  
    // Error response handler (for known operational errors)
    res.sendError = (message, statusCode = 500, errors = []) => {
      console.log("[DEBUG] Sending error response:", message);
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