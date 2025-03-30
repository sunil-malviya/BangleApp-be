import CuttingJobService from "./cuttingjob.service.js";

class CuttingJobController {
  static async createCuttingJob(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const body = req.getBody([
        "karigarId",
        "createdDate",
        "completionDate",
        "cuttingItems",
        "note",
        "isOnlineWorker",
      ]);

      const data = await CuttingJobService.arrangeData(body, organization_id);
      const result = await CuttingJobService.createCuttingJob(data);
      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async getCuttingJobs(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const page = req.query.pageNo ? parseInt(req.query.pageNo, 10) : 1;
      let filter = req.query.filter ? JSON.parse(req.query.filter) : {};

      let cond = {
        organizationId: organization_id,
        isdeleted: 0,
        status: filter.status,
      };

      if (filter.dateRange && filter.dateRange.from && filter.dateRange.to) {
        cond.createdDate = {
          gte: new Date(filter.dateRange.from),
          lte: new Date(filter.dateRange.to),
        };
      }

      if (filter.search && filter.search.trim() !== "") {
        cond.workerOffline = {
          fullName: {
            contains: filter.search,
            mode: "insensitive",
          },
        };
      }

      const records = await CuttingJobService.getAllCuttingJobs(cond, page);
      res.infintescroll(records, page);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getCuttingJobById(req, res) {
    try {
      const id = req.params.id;
      const result = await CuttingJobService.getCuttingJobById(id);
      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async updateCuttingJob(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const id = req.params.id;

      const body = req.getBody([
        "karigarId",
        "createdDate",
        "completionDate",
        "cuttingItems",
        "note",
        "isOnlineWorker",
      ]);

      const data = await CuttingJobService.arrangeData(body, organization_id);
      const result = await CuttingJobService.updateCuttingJob(id, data);
      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async deleteCuttingJobs(req, res) {
    try {
      const ids = req.query?.ids;
      const idarry = JSON.parse(ids);
      const result = await CuttingJobService.deleteCuttingJob(idarry);
      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async receiveCuttingItems(req, res) {
    try {
      const name = req.user.fullName;
      const body = req.getBody(["id", "quantity"]);
      const result = await CuttingJobService.receiveCuttingItems(body.id, {
        quantity: body.quantity,
        receivedBy: name,
      });
      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async getPipeStocks(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const filters = req.query.filters ? JSON.parse(req.query.filters) : {};
      const result = await CuttingJobService.getPipeStocks(organization_id, filters);
      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async getNaginhas(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const result = await CuttingJobService.getNaginhas(organization_id);
      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
}

export default CuttingJobController; 