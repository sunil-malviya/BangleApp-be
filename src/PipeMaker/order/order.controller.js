import Orderservice from "./order.service.js";

class OrderController {
  static async getPipejobs(req, res) {
    try {

      const organization_id = req.user.id;
      const page = req.query.pageNo ? parseInt(req.query.pageNo, 10) : 1;
      let filter = req.query.filter ? JSON.parse(req.query.filter) : {};

      let cond = {
        workerOnlineId: organization_id,

        isdeleted: 0,
        status: filter.status,
      };

      if (filter.status === 0) {
        (cond.status = 1), (cond.pipemakerstatus = { not: 1 });
      }

      if (filter.status === 1) {
        cond.pipemakerstatus = 1;
        cond.status = { in: [1, 2] };
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
        cond.organization = {
          orgName: {
            contains: filter.search,
            mode: "insensitive",
          },
        };
      }

      const records = await Orderservice.getAllPipejob(cond, page);

      res.infintescroll(records, page);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getPipejobbyId(req, res) {
    try {
      const records = await Orderservice.getPipejobById(req.params.id);

      res.success(records);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async updatepipemakerstatus(req, res) {
    try {
      const id = req.params.id;

      const result = await Orderservice.acceptjob(id, {
        pipemakerstatus: 1,
        status: 2,
      });

      res.success(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async rejectpipemakerjob(req, res) {
    try {
      const id = req.params.id;
      const body = req.getBody(["reason"]);

      const result = await Orderservice.updatejobstatus(id, {
        workernote: body.reason,
        pipemakerstatus: 2,
      });

      res.success(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }


  static async getPipereminder(req, res) {
    try {
      
      const userId = req.user.id;
      const records = await Orderservice.getMaterailreminder({recipientId:userId,isRead:false});
;
      res.success(records);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }















}

export default OrderController;
