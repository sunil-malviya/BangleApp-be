import PipejobService from "./pipejob.service.js";
import Orderservice from "./../../PipeMaker/order/order.service.js";

class PipejobController {
  static async createPipejob(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const body = req.getBody([
        "pipeMakerId",
        "createdDate",
        "completionDate",
        "pipeItems",
        "materialItems",
        "isOnlineWorker",
        "note",
      ]);

      const totalorder = await Orderservice.getOrdercount({
        organizationId: organization_id,
        status: { in: [1, 2, 3] },
      });

      const data = await PipejobService.Arrangedata(body, organization_id);
      data.obj.jobNumber = totalorder + 1;

      const result = await PipejobService.createPipejob(data);

      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
  static async getPipejobs(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const page = req.query.pageNo ? parseInt(req.query.pageNo, 10) : 1;
      let filter = req.query.filter ? JSON.parse(req.query.filter) : {};

  console.log(filter, "filter");
      let cond = {
        organizationId: organization_id,
        isdeleted: 0,
        status: filter.status,
      };
  
      if (filter.status === 1) {
        cond.pipemakerstatus = { not: 1 };
      }
  
      if (filter.status === 2) {
        cond.pipemakerstatus = 1;
      }
  
      if (filter.dateRange && filter.dateRange.from && filter.dateRange.to) {
        const fromDate = new Date(filter.dateRange.from);
        const toDate = new Date(filter.dateRange.to);
      
  
        toDate.setHours(23, 59, 59, 999);
      
        cond.createdDate = {
          gte: fromDate,
          lte: toDate,
        };
      }
  
      if (
        filter.sizes?.length ||
        filter.weights?.length ||
        filter.colors?.length
      ) {
        let pipeItemsFilter = {};
        let orConditions = [];
  
        // Apply Color filter strictly
        if (filter.colors?.length) {
          pipeItemsFilter.Color = { in: filter.colors };
        }
  
        // Add sizes into OR condition
        if (filter.sizes?.length) {
          const sizeConditions = filter.sizes.map((size) => ({
            sizeQuantities: {
              array_contains: [{ size }],
            },
          }));
          orConditions.push(...sizeConditions);
        }
  
        // Add weights into OR condition
        if (filter.weights?.length) {
          const weightConditions = filter.weights.map((weight) => ({
            sizeQuantities: {
              array_contains: [{ weight }],
            },
          }));
          orConditions.push(...weightConditions);
        }
  
        if (orConditions.length) {
          pipeItemsFilter.OR = orConditions;
        }
  
        cond.pipeItems = { some: pipeItemsFilter };
      }
  
      if (filter.search && filter.search.trim() !== "") {
        cond.OR = [
          {
            workerOffline: {
              fullName: {
                contains: filter.search,
                mode: "insensitive",
              },
            },
          },
          {
            workerOnline: {
              fullName: {
                contains: filter.search,
                mode: "insensitive",
              },
            },
          },
        ];
      }
      
  console.log(cond)
   
      const records = await PipejobService.getAllPipejob(cond, page);
      res.infintescroll(records, page);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
  

  static async getPipejobbyId(req, res) {
    try {
      const records = await PipejobService.getPipejobById(req.params.id);

      res.success(records);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async UpdatePipejob(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const id = req.params.id;

      const body = req.getBody([
        "pipeMakerId",
        "createdDate",
        "completionDate",
        "pipeItems",
        "materialItems",
        "isOnlineWorker",
        "note",
      ]);

      const data = await PipejobService.Arrangedata(body, organization_id);

      const result = await PipejobService.updatePipejob(id, data);

      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async Deletepipejobs(req, res) {
    try {
      const ids = req.query?.ids;
      const idarry = JSON.parse(ids);

      const result = await PipejobService.deletePipejob(idarry);

      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async Recievedpipeitems(req, res) {
    try {

      console.log(req.body)
      const name = req.user.fullName;
      const organization_id = req.user.organization.id;
      const body = req.getBody(["id", "color_code","color" ]);
      const newLog = {
        timestamp: new Date().toISOString(),
        receivedBy: name,
        receivedQuantity: 0,
      };

      const result = await PipejobService.RecievedPipeMark(body.id, {


        color: body.color,
        colorcode: body.color_code,
        newLog,
        organization_id: organization_id,
      });
      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async updatejobstatus(req, res) {
    try {
      const id = req.params.id;

      const result = await PipejobService.updatejobstatus(id, 1);

      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
}

export default PipejobController;
