import Prisma from '../../../db/prisma.js';

class MasterService {

// ------------------------worker master-----------------------------------
  static async isExist(data) {
    return await Prisma.worker.findUnique({
      where: {
        organizationId: data.organizationId,
        mobile: data.mobile
      }
    });
  }

  static async createWorkerMaster(data) {
    return await Prisma.worker.create({ data });
  }
  static async fetchWorkerMaster(condition) {
    return await Prisma.worker.findMany({
      where: condition,
      orderBy: {
        fullName: "asc",
      },
    });
  }
  
  static async fetchByIdWorkerMaster(organizationId, masterId) {
    return await Prisma.worker.findMany({
      where: {
        organizationId: organizationId,
        id: masterId
      }
    });
  }

  static async updateWorkerMasterById(masterId, data) {
    return await Prisma.worker.update({
      where: {
        id: masterId
      },
      data: data
    });
  }


  static async isExistId(organizationId, masterId) {
    return await Prisma.worker.findUnique({
      where: {
        organizationId: organizationId,
        id: masterId
      }
    });
  }

  static async deleteWorkerMasterById(organizationId, masterId) {
    return await Prisma.worker.delete({
      where: {
        organizationId: organizationId,
        id: masterId
      }
    });
  }



  // ------------------------nagina master-----------------------------------
  static async isExist(data) {
    return await Prisma.nagina.findUnique({
      where: {
        organizationId: data.organizationId,
        naginaSize: data.naginaSize
      }
    });
  }

  static async createNaginaMaster(data) {
    return await Prisma.nagina.create({ data });
  }
  static async fetchNaginaMaster(condition) {
    return await Prisma.nagina.findMany({
      where: condition,
      orderBy: {
        naginaName: "asc",
      },
    });
  }
  
  static async fetchByIdNaginaMaster(organizationId, naginaMasterId) {
    return await Prisma.nagina.findMany({
      where: {
        organizationId: organizationId,
        id: naginaMasterId
      }
    });
  }

  static async updateNaginaMasterById(naginaMasterId, data) {
    return await Prisma.nagina.update({
      where: {
        id: naginaMasterId
      },
      data: data
    });
  }


  static async isExistNaginaMasterId(organizationId, naginaMasterId) {
    return await Prisma.nagina.findUnique({
      where: {
        organizationId: organizationId,
        id: naginaMasterId
      }
    });
  }

  static async deleteNaginaMasterById(organizationId, naginaMasterId) {
    return await Prisma.nagina.delete({
      where: {
        organizationId: organizationId,
        id: naginaMasterId
      }
    });
  }
  static async GetOnlinePipemaker(cond) {
    console.log(cond)
  return await Prisma.user.findMany({
      where:cond,
    
      include: {
        organization: true, 
      },
    });
  }

  static async GetOnlineKarigar(cond) {
    console.log(cond)
  return await Prisma.user.findMany({
      where:cond,
      include: {
        organization: true, 
      },
    });
  }

}

export default MasterService;
