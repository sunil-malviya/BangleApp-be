import MasterService from "./master.service.js";

class MasterController {
  // ------------------------worker master-----------------------------------

  static async createWorkerMaster(req, res) {
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

      const workerMaster = await MasterService.createWorkerMaster(body);

      return res.status(201).json({
        status: true,
        data: workerMaster,
        message: "Worker master create successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async getWorkerMaster(req, res) {
    try {
      const organizationId = req.user.organization.id || null;
      const masterId = req.params?.id || null;
      const masterType = req.query?.masterType || null;
      const search =
        req.query.search && req.query.search !== "undefined"
          ? req.query.search
          : false;

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

      const workerMaster = await MasterService.fetchWorkerMaster(condition);

      return res.status(200).json({
        status: true,
        data: workerMaster,
        message:
          workerMaster.length > 0
            ? "Get all master successfully!"
            : "No master found!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async updateByIdWorkerMaster(req, res) {
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

      const workerMaster = await MasterService.updateWorkerMasterById(
        masterId,
        body
      );

      return res.status(200).json({
        status: true,
        data: workerMaster,
        message: "Worker master update successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async deleteByIdWorkerMaster(req, res) {
    try {
      const organizationId = req.user.organization.id;
      const masterId = String(req.params.id);

      const isExistWorkerMaster = await MasterService.isExistId(
        organizationId,
        masterId
      );

      if (!isExistWorkerMaster) {
        return res.status(400).json({
          status: false,
          message: "Worker master not found!",
        });
      }
      const workerMaster = await MasterService.deleteWorkerMasterById(
        organizationId,
        masterId
      );

      return res.status(200).json({
        status: true,
        data: workerMaster,
        message: "Worker master delete successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  // ------------------------nagina master-----------------------------------

  static async createNaginaMaster(req, res) {
    // console.log("body data=", req.body);
    try {
      const body = req.getBody(["naginaName", "naginaSize", "image"]);

      body.organizationId = req.user.organization.id;

      const naginaMaster = await MasterService.createNaginaMaster(body);

      return res.status(201).json({
        status: true,
        data: naginaMaster,
        message: "Nagina master create successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async getNaginaMaster(req, res) {
    try {
      const organizationId = req.user.organization.id || null;
      const naginaMasterId = req.params?.id || null;
      const search =
        req.query.search && req.query.search !== "undefined"
          ? req.query.search
          : false;

      let condition = { organizationId };
      if (naginaMasterId) {
        condition.id = naginaMasterId;
      }

      if (search) {
        condition.naginaName = { contains: search, mode: "insensitive" }; // Case-insensitive search
      }

      const naginaMaster = await MasterService.fetchNaginaMaster(condition);
      return res.status(200).json({
        status: true,
        data: naginaMaster,
        message:
          naginaMaster.length > 0
            ? "Get all Nagina master successfully!"
            : "No nagina master found!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async updateByIdNaginaMaster(req, res) {
    try {
      const body = req.getBody(["naginaName", "naginaSize", "image"]);

      body.organizationId = req.user.organization.id;
      const naginaMasterId = String(req.params.id);

      const naginaMaster = await MasterService.updateNaginaMasterById(
        naginaMasterId,
        body
      );

      return res.status(200).json({
        status: true,
        data: naginaMaster,
        message: "Nagina master update successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async deleteByIdNaginaMaster(req, res) {
    try {
      const organizationId = req.user.organization.id;
      const naginaMasterId = String(req.params.id);

      const isExistNaginaMaster = await MasterService.isExistNaginaMasterId(
        organizationId,
        naginaMasterId
      );
      if (!isExistNaginaMaster) {
        return res.status(400).json({
          status: false,
          message: "Nagina master not found!",
        });
      }
      const naginaMaster = await MasterService.deleteNaginaMasterById(
        organizationId,
        naginaMasterId
      );

      return res.status(200).json({
        status: true,
        data: naginaMaster,
        message: "Nagina master delete successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async FetchPipemaker(req, res) {
    try {
      const search =
        req.query.search && req.query.search !== "undefined"
          ? req.query.search
          : false;

      const filter = {
        organization: {
          orgType: "PIPEMAKER",
        },
      };

      if (search && search.trim() !== "") {
        filter.OR = [
          { fullName: { contains: search, mode: "insensitive" } },
          { mobile: { contains: search, mode: "insensitive" } },
        ];
      }

      const records = await MasterService.GetOnlinePipemaker(filter);

      res.success(records);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default MasterController;
