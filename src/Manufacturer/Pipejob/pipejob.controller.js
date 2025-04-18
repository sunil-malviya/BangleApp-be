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
        cond.createdDate = {
          gte: new Date(filter.dateRange.from),
          lte: new Date(filter.dateRange.to),
        };
      }

      if (
        filter.sizes?.length ||
        filter.weights?.length ||
        filter.colors?.length
      ) {
        let pipeItemsFilter = {};

        if (filter.sizes?.length) {
          pipeItemsFilter.size = { in: filter.sizes };
        }

        if (filter.weights?.length) {
          pipeItemsFilter.weight = { in: filter.weights };
        }

        if (filter.colors && filter.colors.length) {
          let colorConditions = filter.colors.map((colorName) => ({
            colorQuantities: {
              array_contains: [{ color: { name: colorName } }],
            },
          }));

          pipeItemsFilter.OR = colorConditions;
        }

        cond.pipeItems = { some: pipeItemsFilter };
      }

      if (filter.search && filter.search.trim() !== "") {
        cond.workerOffline = {
          fullName: {
            contains: filter.search,
            mode: "insensitive",
          },
        };
      }

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
      const name = req.user.fullName;
      const organization_id = req.user.organization.id;
      const body = req.getBody(["id", "weight", "item", "quantity"]);
      const newLog = {
        timestamp: new Date().toISOString(),
        receivedBy: name,
        receivedQuantity: body.quantity,
      };

      const result = await PipejobService.RecievedPipeMark(body.id, {
        quantity: body.quantity,
        weight: body.weight,
        color: body.item.color.name,
        colorcode: body.item.color.value,
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
