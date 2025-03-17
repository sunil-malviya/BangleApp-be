import DesignService from "./design.service.js";
import { getFullImagePath } from "./../../../utils/helper.js";
import {
  UploadTo,
  deleteFile,
} from "./../../../middleware/validator/Storage.js";
class DesignController {
  static async createDesign(req, res) {
    try {
      const body = req.getBody([
        "name",
        "details",
        "sizeFrom",
        "sizeTo",
        "rate",
        "colorValue",
      ]);

      if (req.files && req.files.length > 0) {
        body.images = req.files.map((file) => file.filename);
        body.image = body.images[0];
      }

      body.organizationId = req.user.organization.id;
      body.colorValue = body?.colorValue?.split(",").map((v) => v.trim());

      const design = await DesignService.createDesign(body);

      res.status(200).json({
        status: true,
        data: design,
        message: "Designs created successfully",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async getAllDesigns(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const page = req.query.page || 1;

      const designs = await DesignService.getAllDesigns({
        page,
        filters: { organizationId: organization_id },
      });

      if (Array.isArray(designs)) {
        designs.forEach((design) => {
          if (design.image) {
            design.image = getFullImagePath(design.image, "Design", req);
          }

          if (Array.isArray(design.images)) {
            design.images = design.images.map((img) =>
              getFullImagePath(img, "Design", req)
            );
          }
        });
      }

      res.status(200).json({
        status: true,
        data: designs,
        message: "Designs fetched successfully",
      });
    } catch (error) {
      res.someThingWentWrong(error);
    }
  }

  static async getDesignById(req, res) {
    try {
      const design = await DesignService.getDesignById(req.params.id);
      if (!design) return res.status(404).json({status:false, message: "Design not found",data:null});



      res.status(200).json({
        status: true,
        data: design,
        message: "Designs fetched successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateDesign(req, res) {
    try {
      const id = req.params.id;

      const record = await DesignService.getDesignById(id);
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
        deleteFile(record.images,"designs");

        body.images = req.files.map((file) => file.filename);
        body.image = body.images[0];
      }

      body.colorValue = body?.colorValue?.split(",").map((v) => v.trim());

      const design = await DesignService.updateDesign(id, body);
    
      return res.status(200).json({
        status: true,
        data: design,
        message: "Designs updated successfully",
      });
    } catch (error) {
      res.someThingWentWrong(error);
    }
  }

  static async deleteDesign(req, res) {
    try {
      await DesignService.deleteDesign(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.someThingWentWrong(error);
    }
  }
}

export default DesignController;
