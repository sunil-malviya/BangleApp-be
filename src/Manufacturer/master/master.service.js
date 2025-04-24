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
  return await Prisma.user.findMany({
      where:cond,
      include: {
        organization: true, 
      },
    });
  }

  // ------------------------cutting sample master-----------------------------------
  static async isExistCuttingSampleName(organizationId, sampleName) {
    return await Prisma.cuttingSample.findFirst({
      where: {
        organizationId,
        sampleName,
        isDeleted: 0
      }
    });
  }

  static async createCuttingSample(data) {
    return await Prisma.cuttingSample.create({ data });
  }

  static async fetchCuttingSamples(condition) {
    return await Prisma.cuttingSample.findMany({
      where: condition,
      orderBy: {
        sampleName: "asc",
      },
      include: {
        nagina: true
      }
    });
  }
  
  static async fetchCuttingSampleById(organizationId, id) {
    return await Prisma.cuttingSample.findFirst({
      where: {
        organizationId,
        id,
        isDeleted: 0
      },
      include: {
        nagina: true
      }
    });
  }

  static async updateCuttingSampleById(id, data) {
    return await Prisma.cuttingSample.update({
      where: {
        id
      },
      data,
      include: {
        nagina: true
      }
    });
  }

  static async deleteCuttingSampleById(organizationId, id) {
    return await Prisma.cuttingSample.update({
      where: {
        organizationId,
        id
      },
      data: {
        isDeleted: 1
      }
    });
  }
  
  static async permanentDeleteCuttingSampleById(organizationId, id) {
    return await Prisma.cuttingSample.delete({
      where: {
        organizationId,
        id
      }
    });
  }

  static async bulkDeleteCuttingSamples(organizationId, ids) {
    return await Prisma.cuttingSample.updateMany({
      where: {
        organizationId,
        id: {
          in: ids
        }
      },
      data: {
        isDeleted: 1
      }
    });
  }

}

export default MasterService;
