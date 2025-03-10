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
    const { designation } = req.query;  // Get the 'designation' from the query parameters
    console.log("upload query>>>>>>>>>>>", JSON.stringify(req.query));
    if (!designation) {
      return cb(new Error('Designation is required'), null);  // Error if designation is missing
    }

    const uploadPath = path.join(__dirname, '../public/uploads', designation);  // Define the upload path
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });  // Create the directory if it doesn’t exist
    }
    cb(null, uploadPath);  // Callback to proceed with the upload
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);  // Unique file name
    cb(null, `${req?.query?.designation}-${uniqueSuffix}-${file.originalname}`);  // Set the file name to avoid overwriting
  },
});

// Define multer upload configuration with limits and file filter
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // Set a 5MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;  // Accept only images (jpeg, jpg, png)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);  // Accept the file
    } else {
      cb(new Error('Only images (jpeg, jpg, png) are allowed'));  // Reject the file
    }
  },
});