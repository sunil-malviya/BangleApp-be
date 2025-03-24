import MasterService from "./master.service.js";


class MasterController {
  static async createMaster(req, res) {
    console.log("body data=", req.body)
    try {
      const body = req.getBody([
        "fullName",
        "mobile",
        "address",
        "shopName",
        "workerType",
        "status",
      ]);

      body.organizationId = req.user.organization.id;

      const isExistMaster = await MasterService.isExist(body);

      if (isExistMaster) {
        return res.status(400).json({
          status: false,
          message: `Mobile number ${body.mobile} already exists!`,
        });
      }

      const master = await MasterService.createMaster(body);


      return res.status(201).json({
        status: true,
        data: master,
        message: "Master create successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async getMaster(req, res) {
    try {

      const organizationId = req.user.organization.id || null;
      const masterId = req.params.id || null
      const masterType = req.query.masterType || null
      const search = req.query.search || null
      let condition = { organizationId };
      if (masterId) {
        condition.id = masterId;
      }
      if (masterType) {
        condition.workerType = masterType
      }
      if (search) {
        condition.fullName = { contains: search, mode: "insensitive" }; // Case-insensitive search
      }


      const master = await MasterService.fetchMaster(condition);
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
      const masterId = String(req.params.id)

      const master = await MasterService.updateMasterById(masterId, body);


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
      const masterId = String(req.params.id)

      const isExistMaster = await MasterService.isExistId(organizationId, masterId)

      if (isExistMaster.length === 0) {
        return res.status(400).json({
          status: false,
          message: "Master not found!",
        });
      }
      const master = await MasterService.deleteMasterById(organizationId, masterId);

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

export default MasterController;
