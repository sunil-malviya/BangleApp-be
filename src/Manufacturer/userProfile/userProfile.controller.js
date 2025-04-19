import userProfileService from "./userProfile.service.js";
import { getFullImagePath } from "./../../../utils/helper.js";

import {
  UploadTo,
  deleteFile,
} from "./../../../middleware/validator/Storage.js";
class userProfileController {

  static async updateUserProfile(req, res) {
    try {
      // console.log("Request Received:", req.body); // Debugging
  
      const id = req.body.id;
      if (!id) {
        return res.status(400).json({ status: false, message: "User ID is required" });
      }
  
      const newProfilePic = req.file ? req.file.filename : null;
  
      const existingUser = await userProfileService.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ status: false, message: "User not found" });
      }
  
      if (req?.file?.filename && existingUser[0]?.image) {
        deleteFile(existingUser[0].image, "profile");
      }

  
      const updatedData = {
        ...req.body, 
        image: newProfilePic || existingUser.image, // Use new image if available
      };
  
      const record = await userProfileService.updateProfileById(id, updatedData);
      record.image = getFullImagePath(record.image, "profile", req);
      return res.status(200).json({
        status: true,
        data: record,
        message: "User profile updated successfully",
      });
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      res.status(500).json({ status: false, message: "Something went wrong", error });
    }
  }



  static async updateManufacturerProfile(req, res) {
    try {
      // console.log("Request Received:", req.body); // Debugging
      // console.log("Request Received:", req.file); // Debugging
  
      const id = req.body.id;
      if (!id) {
        return res.status(400).json({ status: false, message: "Manufacturer ID is required" });
      }
  
      const newProfilePic = req.file ? req.file.filename : null;
  
      const existingUser = await userProfileService.getManufacturerById(id);
      if (!existingUser) {
        return res.status(404).json({ status: false, message: "Manufacturer not found" });
      }
      if (req?.file?.filename && existingUser[0]?.orgLogo) {
        deleteFile(existingUser[0].orgLogo, "logo");
      }

  
      const updatedData = {
        ...req.body, 
        orgLogo: newProfilePic || existingUser.orgLogo, // Use new image if available
      };
  
      const record = await userProfileService.updateManufacturerProfileById(id, updatedData);
      record.orgLogo = getFullImagePath(record.orgLogo, "logo", req);
      console.log("Updated Record:", record); // Debugging
      return res.status(200).json({
        status: true,
        data: record,
        message: "Manufacturer profile updated successfully",
      });
    } catch (error) {
      console.error("Error in updateManufacturerProfile:", error);
      res.status(500).json({ status: false, message: "Something went wrong", error });
    }
  }

}



export default userProfileController;
