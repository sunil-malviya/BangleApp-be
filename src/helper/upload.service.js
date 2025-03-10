
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No image file received.");
    }

    const { designation } = await req.query;  // Extract the 'designation' from the body
    const imageUrl = `uploads/${designation}/${req.file.filename}`;  // Generate the image URL
    
    // Respond with the success message and image data
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
        filename: req.file.filename,
        designation,
      },
    });
  } catch (error) {
    console.error("Image upload service error >>>>>>>>>>>", error);
    res.status(200).json({ success: false, message: 'Failed to upload image', error: error.message });
  }
};


export const deleteImage = (req, res) => {
  try{
  const { designation, filename } = req.params;
  const filePath = path.join(__dirname, '../../public/uploads', designation, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(200).json({success:false, message: 'File not found' });
      }
      return res.status(200).json({success:false, message: 'Error deleting file' });
    }
    res.status(200).json({success:true, message: 'Image deleted successfully' });
  });
}catch(err){
  console.log("image delete error",err)
  return res.status(200).json({success:false, message: 'Error deleting file' });
}
};
