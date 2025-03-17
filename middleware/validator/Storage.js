import multer from "multer";
import fs from "fs";
import path from "path";
import {
  SUPPORTED_FORMATS_IMAGE,
  SUPPORTED_FORMATS_DOC,
} from "./formValidConfig.js";

export class UploadTo {
  constructor({
    dir = "admins",
    isImage = false,
    isDoc = false,
    fileSize = 2,
  }) {
    const maxAllowSize = fileSize * Math.pow(1024, 2);

    const fileFilter = (req, file, cb) => {
      const reqSize = parseInt(req.headers["content-length"]);

      if (reqSize && reqSize > maxAllowSize) {
        req.fileValidationError = {
          [file.fieldname]: "Uploaded file is too large to upload..!!",
        };
        return cb(
          null,
          false,
          new Error("Uploaded file is too large to upload..!!")
        );
      }

      if (isImage && !SUPPORTED_FORMATS_IMAGE.includes(file.mimetype)) {
        req.fileValidationError = {
          [file.fieldname]: "Please select only Image ",
        };
        return cb(null, false, new Error("Please select only Image "));
      }

      if (isDoc && !SUPPORTED_FORMATS_DOC.includes(file.mimetype)) {
        req.fileValidationError = {
          [file.fieldname]: "Please select document file Only..!!",
        };
        return cb(
          null,
          false,
          new Error("Please select document file Only..!!")
        );
      }

      cb(null, true);
    };

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const pathToSave = `public/uploads/${dir}`;
        fs.mkdirSync(pathToSave, { recursive: true });
        cb(null, pathToSave);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}`);
      },
    });

    this.upload = multer({
      storage,
      fileFilter,
      limits: { fileSize: maxAllowSize },
    });
  }

  none() {
    return this.upload.none();
  }

  single(fieldName) {
    return this.upload.single(fieldName);
  }

  array(fieldName, maxCount = 5) {
    return this.upload.array(fieldName, maxCount);
  }

  fields(fieldsArray) {
    return this.upload.fields(fieldsArray);
  }
}

export const deleteFile = (deleteFiles, dir) => {
  try {
    if (!deleteFiles) return true;

    // Convert to an array if it's a single string
    const files = Array.isArray(deleteFiles) ? deleteFiles : [deleteFiles];

    files.forEach((file) => {
      if (!file) return;

      const fullPath = `public/uploads/${dir}/${file}`;

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    return true;
  } catch (error) {
    return false;
  }
};
