import Prisma from "./../../../db/prisma.js";

class Orderservice {
  static async getAllPipejob(filters = {}, page = 1, pageSize = 5) {
    return await Prisma.pipeMakerJob.findMany({
      where: filters,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        organization: true,
        workerOnline: true,
        pipeItems: true,
      },
      orderBy: {
        ["createdDate"]: "asc",
      },
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

  static async getOrdercount(cond) {
    return await Prisma.pipeMakerJob.count({
      where: cond,
    });
  }

  static async updatejobstatus(id, data) {
    return await Prisma.pipeMakerJob.update({
      where: { id },
      data: data,
    });
  }

  static async getRecentOrder(cond, limit = 3) {
    return await Prisma.pipeMakerJob.findMany({
      where: cond,
      include: {
        organization: true,
        pipeItems: true,
      },
      orderBy: {
        createdDate: "desc",
      },
      take: limit,
    });
  }

  static async acceptjob(id, data) {
    return await Prisma.$transaction(async (tx) => {
      const updatejob = await tx.pipeMakerJob.update({
        where: { id },
        data,
        include: {
          organization: true,
     
        },
      });
      console.log("updatejob", updatejob);
  
      if (updatejob.materialDetails.length === 0) {
        return updatejob;
      }
  
      const isOnline = updatejob.workerStatus === "Online";
      const workerId = isOnline
        ? updatejob.workerOnlineId
        : updatejob.workerOfflineId;



        const whereClause = isOnline
        ? { organizationId_workerOnlineId: { organizationId: updatejob.organizationId, workerOnlineId: workerId } }
        : { organizationId_workerOfflineId: { organizationId: updatejob.organizationId, workerOfflineId: workerId } };
    

  
      for (const material of updatejob.materialDetails) {

        
        await tx.pipeRawMaterialWallet.upsert({
          where: whereClause,
          update: {
            avaliblequantity: { increment: material.quantity },
          },
          create: {
            materialname: material.name,
            type: "Pipe",
            avaliblequantity: material.quantity,
            organizationId: updatejob.organizationId,
            workerStatus: updatejob.workerStatus,
            workerOnlineId: isOnline ? workerId : null,
            workerOfflineId: isOnline ? null : workerId,
          },
        });
      }
  
      const materialList = updatejob.materialDetails
        .map((mat) => `${mat.materialname} (${mat.quantity})`)
        .join(", ");
  
      await tx.PipeReminder.create({
        data: {
          title: "Material Collection Reminder",
          message: `Please collect the following materials for order ID ${updatejob.jobNumber}: ${materialList}. Provided by ${updatejob.organization.name}.`,
          type: "INFO",
          recipientId: workerId,
          jobId: updatejob.id,
        },
      });
  
      return updatejob;
    });
  }
  ;
  

  /////----------------------------------------------------------------------------/////
}

export default Orderservice;
