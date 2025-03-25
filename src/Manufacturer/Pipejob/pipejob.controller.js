import PipejobService from "./pipejob.service.js";

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
      ]);

      const data = await PipejobService.Arrangedata(body, organization_id);

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
      const page = req?.query?.pageNo  ? req?.query?.pageNo: 1;
      const filter = req.query.filter || null;
console.log(req.query)
      let cond = { organizationId: organization_id,isdeleted:0,...filter };

      const records = await PipejobService.getAllPipejob(cond,page)

    

      setTimeout(() => {
        res.infintescroll(records, page);
      }, 2000);
      
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  }















}

export default PipejobController;
