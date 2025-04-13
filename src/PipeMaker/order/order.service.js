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
        createdDate: 'desc',
      },
      take: limit,
    });
  }


  /////----------------------------------------------------------------------------/////
}

export default Orderservice;
