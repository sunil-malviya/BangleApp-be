import NaginaMasterService from "./naginaMaster.service.js";

class NaginaMasterController {
  static async createNaginaMaster(req, res) {
    console.log("req==",req.body)
    try {
      const body = req.getBody([
        "naginaName",
        "naginaSize",
        "image",
      ]);
      console.log("req==",body)
      body.organizationId = req.user.organization.id;

      const master = await NaginaMasterService.createNaginaMaster(body);

      return res.status(201).json({
        status: true,
        data: master,
        message: "Nagina master create successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async getMaster(req, res) {
    try {
      const organizationId = req.user.organization.id || null;
      const masterId = req.params?.id || null;
      const masterType = req.query?.masterType || null;
      const search = req.query.search && req.query.search !== "undefined" ? req.query.search : false;

      let condition = { organizationId };
      if (masterId) {
        condition.id = masterId;
      }
      if (masterType) {
        condition.workerType = masterType;
      }
      if (search) {
        condition.fullName = { contains: search, mode: "insensitive" }; // Case-insensitive search
      }

      const master = await NaginaMasterService.fetchMaster(condition);

      // if (master.length === 0) {
      //   return res.status(404).json({
      //     status: false,
      //     message: "master not found please create master!",
      //   });
      // }

      return res.status(200).json({
        status: true,
        data: master,
        message: master.length > 0 ? "Get all master successfully!" : "No master found!",
      });

    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async updateByIdMaster(req, res) {
    try {
      const body = req.getBody([
        "fullName",
        "address",
        "shopName",
        "workerType",
        "status",
      ]);

      body.organizationId = req.user.organization.id;
      const masterId = String(req.params.id);

      const master = await NaginaMasterService.updateMasterById(masterId, body);

      return res.status(200).json({
        status: true,
        data: master,
        message: "Master update successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async deleteByIdMaster(req, res) {
    try {
      const organizationId = req.user.organization.id;
      const masterId = String(req.params.id);

      const isExistMaster = await NaginaMasterService.isExistId(organizationId, masterId)

      if (isExistMaster.length === 0) {
        return res.status(400).json({
          status: false,
          message: "Master not found!",
        });
      }
      const master = await NaginaMasterService.deleteMasterById(
        organizationId,
        masterId
      );

      return res.status(200).json({
        status: true,
        data: master,
        message: "Master delete successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
}
  
export default NaginaMasterController;
