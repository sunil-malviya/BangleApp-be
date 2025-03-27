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
      const page = req?.query?.pageNo ? req?.query?.pageNo : 1;
      let filter = req.query.filter || null;
      filter = JSON.parse(filter);

      let cond = { organizationId: organization_id, isdeleted: 0, ...filter };

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
      const id = req.params.id

      const body = req.getBody([
        "pipeMakerId",
        "createdDate",
        "completionDate",
        "pipeItems",
        "materialItems",
        "isOnlineWorker",
      ]);

     
      const data = await PipejobService.Arrangedata(body, organization_id);


      const result = await PipejobService.updatePipejob(id,data);

      res.success(result);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
}

export default PipejobController;
