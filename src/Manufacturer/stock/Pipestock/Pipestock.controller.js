import PipeStockService from "./Pipestock.service.js";

class PipeStockController {
  // ------------------------worker master-----------------------------------

  static async getPipestock(req, res) {
    try {
      const organization_id = req.user.organization.id;
      const page = req.query.pageNo ? parseInt(req.query.pageNo, 10) : 1;
      let filter = req.query.filter ? JSON.parse(req.query.filter) : {};
  

  
      let cond = {
        organizationId: organization_id,
        isdeleted: 0,
      };

      if (filter.status === "Available") {
        cond.stock = { gt: 0 };
      }
  
 
      if (filter.sizes?.length) {
        cond.size = filter.sizes.length === 1 
          ? filter.sizes[0].toString() 
          : { in: filter.sizes.map(String) };
      }
  
      if (filter.weights?.length) {
        cond.weight = { in: filter.weights };
      }
  
      if (filter.colors?.length) {
        cond.color = { in: filter.colors };
      }
  

  
      const record = await PipeStockService.GetPipeStock(cond,page);

  
      return res.status(200).json({
        status: true,
        data: record,
        message: "Success",
        page: page,
      });
    } catch (error) {
      console.log("Error in getPipestock:", error);
      return res.status(500).json({ status: false, message: "Something went wrong." });
    }
  }
  

  // ------------------------nagina master-----------------------------------
}

export default PipeStockController;
