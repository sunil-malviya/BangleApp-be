import Prisma from './../../../db/prisma.js';

class designservice {


  static async isExist(data) {
    return await Prisma.worker.findUnique({
      where: {
        organizationId: data.organizationId,
        mobile: data.mobile
      }
    });
  }

  static async createMaster(data) {
    return await Prisma.worker.create({ data });
  }
  static async fetchMaster(condition) {
    return await Prisma.worker.findMany({
      where: condition,
      orderBy: {
        fullName: "asc",
      },
    });
  }
  
  static async fetchByIdMaster(organizationId, masterId) {
    return await Prisma.worker.findMany({
      where: {
        organizationId: organizationId,
        id: masterId
      }
    });
  }

  static async updateMasterById(masterId, data) {
    return await Prisma.worker.update({
      where: {
        id: masterId
      },
      data: data
    });
  }


  static async isExistId(organizationId, masterId) {
    return await Prisma.worker.findMany({
      where: {
        organizationId: organizationId,
        id: masterId
      }
    });
  }

  static async deleteMasterById(organizationId, masterId) {
    return await Prisma.worker.delete({
      where: {
        organizationId: organizationId,
        id: masterId
      }
    });
  }


}

export default designservice;
