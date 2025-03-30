import Prisma from "./../../../db/prisma.js";

class CuttingJobService {
  static async arrangeData(data, org_id) {
    let obj = {
      organization: {
        connect: { id: org_id },
      },
      createdDate: data.createdDate,
      completionDate: data.completionDate,
      note: data.note || "",
    };
    obj.status = 1;

    data.isOnlineWorker
      ? (obj.workerOnlineId = data.karigarId)
      : (obj.workerOffline = { connect: { id: data.karigarId } });

    data.isOnlineWorker
      ? (obj.workerStatus = "Online")
      : (obj.workerStatus = "Offline");

    // Calculate totals
    obj.totalitem = data.cuttingItems.length;
    obj.totalPipeQty = data.cuttingItems.reduce((total, item) => total + item.pipeQty, 0);
    obj.totalAvgBangleQty = data.cuttingItems.reduce((total, item) => total + item.AvgBangleQty, 0);
    obj.totalPrice = data.cuttingItems.reduce((total, item) => total + (item.pipeQty * item.perPipeCuttingPrice), 0);

    return { obj, cuttingItems: data.cuttingItems };
  }

  static async createCuttingJob(data) {
    return await Prisma.$transaction(async (tx) => {
      const result = await tx.cuttingKarigarJob.create({ data: data.obj });

      // Create cutting items
      const cuttingItems = data.cuttingItems.map(item => ({
        ...item,
        jobId: result.id,
        receivedQty: 0,
        receivedDate: null,
        receivedLog: []
      }));

      await tx.cuttingItem.createMany({
        data: cuttingItems,
      });

      return result;
    });
  }

  static async getAllCuttingJobs(filters = {}, page = 1, pageSize = 5) {
    return await Prisma.cuttingKarigarJob.findMany({
      where: filters,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        organization: true,
        workerOffline: true,
        cuttingItems: {
          include: {
            pipeStock: true,
            nagina: true
          }
        }
      },
    });
  }

  static async getCuttingJobById(id) {
    return await Prisma.cuttingKarigarJob.findUnique({
      where: { id },
      include: {
        organization: true,
        workerOffline: true,
        cuttingItems: {
          include: {
            pipeStock: true,
            nagina: true
          }
        }
      },
    });
  }

  static async updateCuttingJob(id, data) {
    return await Prisma.$transaction(async (tx) => {
      const result = await tx.cuttingKarigarJob.update({
        where: { id },
        data: data.obj,
      });

      await tx.cuttingItem.deleteMany({
        where: { jobId: id },
      });

      const cuttingItems = data.cuttingItems.map(item => ({
        ...item,
        jobId: result.id,
        receivedQty: 0,
        receivedDate: null,
        receivedLog: []
      }));

      await tx.cuttingItem.createMany({
        data: cuttingItems,
      });

      return result;
    });
  }

  static async deleteCuttingJob(idOrIds) {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    return await Prisma.cuttingKarigarJob.updateMany({
      where: {
        id: { in: ids },
      },
      data: { isdeleted: 1 },
    });
  }

  static async receiveCuttingItems(id, data) {
    return await Prisma.$transaction(async (tx) => {
      const result = await tx.cuttingItem.findUnique({
        where: { id },
      });

      if (!result) return null;

      const allCuttingItems = await tx.cuttingItem.findMany({
        where: { jobId: result.jobId },
        select: {
          receivedQty: true,
          AvgBangleQty: true
        },
      });

      const totalReceived = allCuttingItems.reduce((sum, item) => sum + item.receivedQty, 0) + data.quantity;
      const totalExpected = allCuttingItems.reduce((sum, item) => sum + item.AvgBangleQty, 0);

      // Update received quantity and log
      const updatedData = {
        receivedQty: result.receivedQty + data.quantity,
        receivedDate: new Date(),
        receivedLog: [
          ...(result.receivedLog || []),
          {
            timestamp: new Date().toISOString(),
            receivedBy: data.receivedBy,
            receivedQuantity: data.quantity,
          },
        ],
      };

      await tx.cuttingItem.update({
        where: { id },
        data: updatedData,
      });

      // Update job status if all items received
      if (totalReceived >= totalExpected) {
        await tx.cuttingKarigarJob.update({
          where: { id: result.jobId },
          data: { status: 2 },
        });
      }

      return result;
    });
  }

  static async getPipeStocks(organizationId, filters = {}) {
    return await Prisma.pipeStock.findMany({
      where: {
        organizationId,
        isdeleted: 0,
        stock: { gt: 0 },
        ...filters
      },
      include: {
        organization: true
      }
    });
  }

  static async getNaginhas(organizationId) {
    return await Prisma.nagina.findMany({
      where: {
        organizationId,
        isdeleted: 0
      }
    });
  }
}

export default CuttingJobService; 