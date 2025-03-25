import PipejobService from "./pipejob.service.js";
import { getFullImagePath } from "./../../../utils/helper.js";
import Prisma from "./../../../db/prisma.js";


const calculatecolorQty = (item) => {
  return item.colorQuantities.reduce((sum, cq) => sum + cq.quantity, 0);
};


const calculateTotalQuantity = () => {
  return formik.values.pipeItems.reduce((total, item) => {
    return total + calculatecolorQty(item);
  }, 0);
};



function jobentry(data,org_id){



let obj = {organizationId:org_id,createDate:data.createdDate,completionDate:data.completionDate   }
obj.status = 1

 data.isOnlineWorker ? obj.workerOnlineId = data.pipeMakerId :  obj.workerOfflineId = data.pipeMakerId
 data.isOnlineWorker ? obj.workerStatus = "Online" :  obj.workerStatus = "Offline"

 data?.materialItems.length > 0 ? obj.materialDetails =data.materialItems :[]
  obj.totalitem =  data.pipeItems.length


return obj

}

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
        "isOnlineWorker"
      ]);

      console.log(body);
   const  data =  jobentry(body,organization_id)

      console.log(data);

      res.success({});
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
}

export default PipejobController;
