import Prisma from "./../../../db/prisma.js";

class Pipejobmakerservice {
  static calculatecolorQty = (item) => {
    return item.colorQuantities.reduce((sum, cq) => sum + cq.quantity, 0);
  };

  static async Arrangedata(data, org_id) {
    let obj = {
      organization: {
        connect: { id: org_id },
      },

      createdDate: data.createdDate,
      completionDate: data.completionDate,
    };
    obj.status = 1;
    //--------------------- check worker type ---------------------------------------//
    // data.isOnlineWorker
    //   ? (obj.workerOnlineId = data.pipeMakerId)
    //   : (obj.workerOfflineId = data.pipeMakerId);

    data.isOnlineWorker
      ? (obj.workerOnlineId = data.pipeMakerId)
      : (obj.workerOffline = { connect: { id: data.pipeMakerId } });

    data.isOnlineWorker
      ? (obj.workerStatus = "Online")
      : (obj.workerStatus = "Offline");

    data?.materialItems && data?.materialItems.length > 0
      ? (obj.materialDetails = data?.materialItems)
      : (obj.materialDetails = []);
    obj.totalitem = data.pipeItems.length;
    obj.totalPipeQty = data.pipeItems.reduce((total, item) => {
      return total + this.calculatecolorQty(item);
    }, 0);

    const updatedPipeItems = data.pipeItems.map((item) => ({
      ...item,
      total_item: item.colorQuantities.length,
      total_qty: this.calculatecolorQty(item),
    }));

    return { obj, updatedPipeItems };
  }

  static async createPipejob(data) {

    return await Prisma.$transaction(async (tx) => {
      const result = await tx.pipeMakerJob.create({ data: data.obj });

      data.updatedPipeItems.forEach((item) => {
        item.jobId = result.id;
      });

      await tx.pipeItem.createMany({
        data: data.updatedPipeItems,
      });

      return result;
    });
  }

  static async getAllPipejob(filters = {}, page = 1, pageSize = 5) {


    return await Prisma.pipeMakerJob.findMany({
      where: filters,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        organization: true,
        workerOffline: true,
        pipeItems: true,
      },
      // orderBy: {
      //   [orderBy]: order,
      // },
    });
  }

  static async getPipejobById(id) {
    return await Prisma.pipeMakerJob.findUnique({
      where: { id },

      include: {
        organization: true,
        workerOffline: true,
        pipeItems: true,
      },
    });
  }

  static async updatePipejob(id, data) {
   
    return await Prisma.$transaction(async (tx) => {
 
      const result = await tx.pipeMakerJob.update({
        where: { id },
        data: data.obj,
      });
  
   
      await tx.pipeItem.deleteMany({
        where: { jobId: id },
      });

      data.updatedPipeItems.forEach((item) => {
        delete item.id;
        item.jobId = result.id
       
      });
  
    
      await tx.pipeItem.createMany({
        data: data.updatedPipeItems,
      });
  
      return result;
    });
  }
  
  static async deleteDesign(id) {
    return await Prisma.design.delete({ where: { id } });
  }
}

export default Pipejobmakerservice;
