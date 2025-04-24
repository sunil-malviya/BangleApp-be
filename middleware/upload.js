import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const { designation } = req.query;  // Get the 'designation' from the query parameters
      console.log("Upload destination request:", {
        query: req.query,
        body: req.body,
        file: {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }
      });
      
      if (!designation) {
        return cb(new Error('Designation is required'), null);  // Error if designation is missing
      }

      const uploadPath = path.join(__dirname, '../public/uploads', designation);  // Define the upload path
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });  // Create the directory if it doesn't exist
      }
      cb(null, uploadPath);  // Callback to proceed with the upload
    } catch (error) {
      console.error("Error in upload destination:", error);
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);  // Unique file name
      const sanitizedOriginalname = file.originalname.replace(/[^a-zA-Z0-9-_.]/g, '_'); // Sanitize filename
      cb(null, `${req.query.designation}-${uniqueSuffix}-${sanitizedOriginalname}`);  // Set the file name to avoid overwriting
    } catch (error) {
      console.error("Error in upload filename:", error);
      cb(error, null);
    }
  },
});

// Define multer upload configuration with limits and file filter
export const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024,  // Set a 5MB file size limit
    files: 1                    // Allow only one file per request
  },
  fileFilter: (req, file, cb) => {
    try {
      const filetypes = /jpeg|jpg|png/;  // Accept only images (jpeg, jpg, png)
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      
      console.log("Upload file filter:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        extname_valid: extname,
        mimetype_valid: mimetype
      });
      
      if (extname && mimetype) {
        cb(null, true);  // Accept the file
      } else {
        cb(new Error(`Only images (jpeg, jpg, png) are allowed. Received ${file.mimetype}`));  // Reject the file
      }
    } catch (error) {
      console.error("Error in upload file filter:", error);
      cb(error, false);
    }
  },
});

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(200).json({ 
        success: false, 
        message: 'File too large. Maximum size is 5MB.' 
      });
    }
    return res.status(200).json({ 
      success: false, 
      message: `Upload error: ${err.message}` 
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(200).json({ 
      success: false, 
      message: `Server error: ${err.message}` 
    });
  }
  
  // If no error, proceed to next middleware
  next();
};