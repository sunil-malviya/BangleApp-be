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

      console.log(cond)
      const records = await Orderservice.getAllPipejob(cond, page);
      console.log(records)

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





}

export default OrderController;
