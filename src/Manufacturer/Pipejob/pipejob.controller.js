import PipejobService from "./pipejob.service.js";
import { getFullImagePath } from "./../../../utils/helper.js";
import Prisma from "./../../../db/prisma.js";


const calculatecolorQty = (item) => {
  return item.colorQuantities.reduce((sum, cq) => sum + cq.quantity, 0);
};

// Calculate total quantity for all pipe items
const calculateTotalQuantity = () => {
  return formik.values.pipeItems.reduce((total, item) => {
    return total + calculatecolorQty(item);
  }, 0);
};


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

      res.success({});
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
}

export default PipejobController;
