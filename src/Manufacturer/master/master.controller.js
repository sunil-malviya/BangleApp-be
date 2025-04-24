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
            AND: [
              {
                organization: {
                  orgType: "PIPEMAKER",
                },
              },
            ],
          };
      
          if (search && search.trim() !== "") {
            filter.AND.push({
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { mobile: { contains: search, mode: "insensitive" } },
              ],
            });
          }
      
      const records = await MasterService.GetOnlinePipemaker(filter);
 

      res.success(records);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async FetchKarigar(req, res) {
    try {


console.log("FetchKarigar called",req.query)

      const search =
        req.query.search && req.query.search !== "undefined"
          ? req.query.search
          : false;
          
      const workerType =
        req.query.workerType && req.query.workerType !== "undefined"
          ? req.query.workerType
          : null;
      
      const filter = {
        organization: {
          orgType:workerType,
        },
      };

      if (search && search.trim() !== "") {
        filter.OR = [
          { fullName: { contains: search, mode: "insensitive" } },
          { mobile: { contains: search, mode: "insensitive" } },
        ];
      }
      
      // Filter by worker type if provided
      // if (workerType) {
      //   filter.workerType = workerType;
      // }


  
      const records = await MasterService.GetOnlineKarigar(filter);

      res.success(records);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  // ------------------------cutting sample master-----------------------------------

  static async createCuttingSample(req, res) {
    try {
      const body = req.getBody([
        "sampleName",
        "cuttingType",
        "cuttingDepth",
        "width",
        "widthUnit",
        "image",
        "description",
        "naginaId",
      ]);

      body.organizationId = req.user.organization.id;

      // Check if cutting sample with same name already exists
      const existingSample = await MasterService.isExistCuttingSampleName(
        body.organizationId,
        body.sampleName
      );

      if (existingSample) {
        return res.status(400).json({
          status: false,
          message: "Cutting sample with this name already exists!",
        });
      }

      const cuttingSample = await MasterService.createCuttingSample(body);

      return res.status(201).json({
        status: true,
        data: cuttingSample,
        message: "Cutting sample created successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async getCuttingSamples(req, res) {
    try {
      const organizationId = req.user.organization.id || null;
      const sampleId = req.params?.id || null;
      const search =
        req.query.search && req.query.search !== "undefined"
          ? req.query.search
          : false;
      
      const cuttingType = req.query.cuttingType || null;
      const naginaId = req.query.naginaId || null;

      let condition = { 
        organizationId,
        isDeleted: 0
      };

      if (sampleId) {
        condition.id = sampleId;
      }

      if (search) {
        condition.sampleName = { contains: search, mode: "insensitive" };
      }

      if (cuttingType) {
        condition.cuttingType = cuttingType;
      }

      if (naginaId) {
        condition.naginaId = naginaId;
      }

      const cuttingSamples = await MasterService.fetchCuttingSamples(condition);

      return res.status(200).json({
        status: true,
        data: cuttingSamples,
        message:
          cuttingSamples.length > 0
            ? "Cutting samples retrieved successfully!"
            : "No cutting samples found!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async getCuttingSampleById(req, res) {
    try {
      const organizationId = req.user.organization.id;
      const sampleId = String(req.params.id);

      const cuttingSample = await MasterService.fetchCuttingSampleById(
        organizationId,
        sampleId
      );

      if (!cuttingSample) {
        return res.status(404).json({
          status: false,
          message: "Cutting sample not found!",
        });
      }

      return res.status(200).json({
        status: true,
        data: cuttingSample,
        message: "Cutting sample retrieved successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async updateCuttingSampleById(req, res) {
    try {
      const body = req.getBody([
        "sampleName",
        "cuttingType",
        "cuttingDepth",
        "width",
        "widthUnit",
        "image",
        "description",
        "naginaId",
      ]);

      body.organizationId = req.user.organization.id;
      const sampleId = String(req.params.id);

      // Check if the sample exists
      const existingSample = await MasterService.fetchCuttingSampleById(
        body.organizationId,
        sampleId
      );

      if (!existingSample) {
        return res.status(404).json({
          status: false,
          message: "Cutting sample not found!",
        });
      }

      // Check if name already exists (but only if name is being changed)
      if (
        body.sampleName && 
        existingSample.sampleName !== body.sampleName
      ) {
        const nameExists = await MasterService.isExistCuttingSampleName(
          body.organizationId,
          body.sampleName
        );

        if (nameExists) {
          return res.status(400).json({
            status: false,
            message: "Cutting sample with this name already exists!",
          });
        }
      }

      const updatedSample = await MasterService.updateCuttingSampleById(
        sampleId,
        body
      );

      return res.status(200).json({
        status: true,
        data: updatedSample,
        message: "Cutting sample updated successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async deleteCuttingSampleById(req, res) {
    try {
      const organizationId = req.user.organization.id;
      const sampleId = String(req.params.id);

      // Check if the sample exists
      const existingSample = await MasterService.fetchCuttingSampleById(
        organizationId,
        sampleId
      );

      if (!existingSample) {
        return res.status(404).json({
          status: false,
          message: "Cutting sample not found!",
        });
      }

      // Soft delete the sample
      await MasterService.deleteCuttingSampleById(
        organizationId,
        sampleId
      );

      return res.status(200).json({
        status: true,
        message: "Cutting sample deleted successfully!",
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async bulkDeleteCuttingSamples(req, res) {
    try {
      const organizationId = req.user.organization.id;
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          status: false,
          message: "Please provide a valid array of sample IDs!",
        });
      }

      // Soft delete multiple samples
      await MasterService.bulkDeleteCuttingSamples(
        organizationId,
        ids
      );

      return res.status(200).json({
        status: true,
        message: `${ids.length} cutting sample(s) deleted successfully!`,
      });
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
}

export default MasterController;
