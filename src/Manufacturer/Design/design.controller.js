import DesignService from "./design.service.js";
import { getFullImagePath } from "./../../../utils/helper.js";
import Prisma from "./../../../db/prisma.js";

import {
  UploadTo,
  deleteFile,
} from "./../../../middleware/validator/Storage.js";
import { json } from "stream/consumers";
class DesignController {
  static async createDesign(req, res) {
    try {
      const body = req.getBody([
        "name",
        "details",
        "sizeFrom",
        "sizeTo",
        "rate",
        "colors",
        "details",
      ]);

      if (req.files && req.files.length > 0) {
        body.images = req.files.map((file) => file.filename);
        body.image = body.images[0];
      }

      body.organizationId = req.user.organization.id;
      if (body.colors) {
        body.colors = JSON.parse(body.colors);
      }
      body.rate = parseFloat(body.rate);
      body.sizeFrom = parseFloat(body.sizeFrom);
      body.sizeTo = parseFloat(body.sizeTo);

      const design = await DesignService.createDesign(body);

      res.success(design);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
  static async getAllDesigns(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const page = req.query.page || 1;
      const filter = req.query.filter || null;
      
      let cond = { organizationId: organization_id };
  
      if (filter) {
        let parsed = JSON.parse(filter);
         cond.rate = {
          gte: 0,
          lte: parsed.rate ?? 1000, 
        };
  

        if (Array.isArray(parsed.colors) && parsed.colors.length > 0) {
          cond.colors = {
            hasSome: parsed.colors,
          };
        }
  
        // Check if parsed.size is valid and has at least 2 values
        if (Array.isArray(parsed.size) && parsed.size.length >= 2) {
          cond.sizeFrom = { lte: parseFloat(parsed.size[0]) };
          cond.sizeTo = { gte: parseFloat(parsed.size[1]) };
        }
      }
  
      console.log(cond);
  
      const designs = await DesignService.getAllDesigns({
        page,
        filters: cond,
      });
  
      if (Array.isArray(designs)) {
        designs.forEach((design) => {
          if (design.image) {
            design.image = getFullImagePath(design.image, "designs", req);
          }
  
          if (Array.isArray(design.images)) {
            design.images = design.images.map((img) =>
              getFullImagePath(img, "designs", req)
            );
          }
        });
      }
  
      res.success(designs);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
  

  static async getDesignById(req, res) {
    try {
      const design = await DesignService.getDesignById(req.params.id);
      if (!design)
        return res
          .status(404)
          .json({ status: false, message: "Design not found", data: null });

      res.success(design);
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
        "colors",
        "images",
      ]);

      if (req.files && req.files.length > 0) {
        deleteFile(record.images, "designs");

        body.images = req.files.map((file) => file.filename);
        body.image = body.images[0];
      }

      if (body.colors) {
        body.colors = JSON.parse(body.colors);
      }

      body.rate = parseFloat(body.rate);
      body.sizeFrom = parseFloat(body.sizeFrom);
      body.sizeTo = parseFloat(body.sizeTo);

      const design = await DesignService.updateDesign(id, body);

      return res.success(design);
    } catch (error) {
      res.someThingWentWrong(error);
    }
  }

  static async deleteDesign(req, res) {
    try {

      const design = await DesignService.getDesignById(req.params.id);

      if (!design)
        return res
          .status(404)
          .json({ status: false, message: "Design not found", data: null });
      await DesignService.deleteDesign(req.params.id);
      if (design?.images[0]) {
        deleteFile(design.images, "designs");
      }

      res.success("Design deleted successfully");
    } catch (error) {
      // console.log(error)
      res.someThingWentWrong(error);
    }
  }

  static async bulkdeleteDesign(req, res) {
    try {
      const { ids } = req.getBody(["ids"]);

      const designs = await DesignService.getDesignByIds(ids);

      if (designs.length === 0)
        return res
          .status(404)
          .json({ status: false, message: "Design not found", data: null });

      await Prisma.$transaction(async (tx) => {
        await tx.design.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        });
      });

      if (Array.isArray(designs)) {
        designs.forEach((design) => {
          if (Array.isArray(design.images)) {
            deleteFile(design.images, "designs");
          }
        });
      }

      res.success("Design deleted successfully");
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
}

export default DesignController;
