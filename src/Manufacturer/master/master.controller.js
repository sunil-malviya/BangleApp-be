import MasterService from "./master.service.js";


class MasterController {
  static async createMaster(req, res) {
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

      const isExistMaster = await MasterService.isExist(body)

      if (isExistMaster.length > 0) {
        return res.status(400).json({
          status: false,
          message: "Mobile number already exists!",
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

      const organizationId = req.user.organization.id;
      const masterId = req.params.id
      const masterType = req.query.masterType
      const search = req.query.search
      let condition = { organizationId };

      if (masterId) {
          condition.id = masterId;
      }
      if (masterType) {
          condition.workerType = masterType.toUpperCase(); // Ensuring consistency
      }
      if (search) {
          condition.fullName = { contains: search, mode: "insensitive" }; // Case-insensitive search
      }


      const master = await MasterService.fetchMaster(condition);
      if (master.length === 0) {
        return res.status(404).json({
          status: false,
          message: "master not found please create master!",
        });
      }

      return res.status(200).json({
        status: true,
        data: master,
        message: "Get all master successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  // static async getByIdMaster(req, res) {
  //   try {
  //     const organizationId = req.user.organization.id;
  //     const masterId = String(req.params.id)

  //     const master = await MasterService.fetchByIdMaster(organizationId, masterId);
  //     if (!master || master.length === 0) {
  //       return res.status(404).json({
  //         status: false,
  //         message: "master not found please create master!",
  //       });
  //     }

  //     return res.status(200).json({
  //       status: true,
  //       data: master,
  //       message: "Get master successfully!",
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.someThingWentWrong(error);
  //   }
  // }

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

      const isExistMaster = await MasterService.isExistId(organizationId,masterId)

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
