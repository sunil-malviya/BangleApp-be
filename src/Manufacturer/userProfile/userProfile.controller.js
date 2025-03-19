import userProfieService from "./userProfile.service.js";
import { getFullImagePath } from "./../../../utils/helper.js";
import {
  UploadTo,
  deleteFile,
} from "./../../../middleware/validator/Storage.js";
class userProfileController {


  static async updateUserProfile(req, res) {
    console.log("successppppp===>>>>")
    try {
      const id = req.params.id;

      const record = await userProfieService.getDesignById(id);
      if (!record) {
        return res
          .status(404)
          .json({ status: false, message: "Design not found" });
      }

      const body = req.getBody([
        "name",
        "details",
        "sizeFrom",
        "sizeTo",
        "rate",
        "colorValubodye",
        "images",
      ]);

      if (req.files && req.files.length > 0) {
        deleteFile(record.images, "designs");

        body.images = req.files.map((file) => file.filename);
        body.image = body.images[0];
      }

      body.colorValue = body?.colorValue?.split(",").map((v) => v.trim());

      const design = await userProfieService.updateDesign(id, body);

      return res.status(200).json({
        status: true,
        data: design,
        message: "Designs updated successfully",
      });
    } catch (error) {
      res.someThingWentWrong(error);
    }
  }


}

export default userProfileController;
