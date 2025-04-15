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
      note: data.note,
    };
    obj.status = data.isOnlineWorker ? 0 : 2;
    obj.pipemakerstatus =  data.isOnlineWorker ? 0 : 1;

    data.isOnlineWorker
      ? (obj.workerOnline = { connect: { id: data.pipeMakerId } })
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
        workerOnline: true,
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
        workerOnline: true,
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
        item.jobId = result.id;
      });

      await tx.pipeItem.createMany({
        data: data.updatedPipeItems,
      });

      return result;
    });
  }

  static async deletePipejob(idOrIds) {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    return await Prisma.pipeMakerJob.updateMany({
      where: {
        id: { in: ids },
      },
      data: { isdeleted: 1 },
    });
  }

  //----------------------- recieved item  enties --------------------------------------------------///

  static async RecievedPipeMark(id, data) {
    return await Prisma.$transaction(async (tx) => {
      const result = await tx.pipeItem.findUnique({
        where: { id },
        include: {
          job: {
            include: {
              workerOnline: {
                include: {
                  organization: true,
                },
              },
              workerOffline: true,
            },
          },
        },
      });

      if (!result) {
        throw new Error('Pipe item not found');
      }

      if (!result.job) {
        throw new Error('Associated job not found');
      }

      // Determine the pipemaker name based on worker type
      let pipemaker;
      if (result.job.workerStatus === 'Online' && result.job.workerOnline?.organization) {
        pipemaker = result.job.workerOnline.organization.orgName;
      } else if (result.job.workerStatus === 'Offline' && result.job.workerOffline) {
        pipemaker = result.job.workerOffline.shopName;
      } else {
        throw new Error('Invalid worker configuration');
      }

      const allpipeitem = await tx.pipeItem.findMany({
        where: { jobId: result.jobId },
        select: {
          colorQuantities: true,
        },
      });

      const totalrecieved = (await this.totalRecievedPipe(allpipeitem)) + data.quantity;

      // Build fresh object with add current received qty
      delete result.job;

      const updatedData = await this.Findandupdateitem(
        result,
        data.color,
        data.quantity,
        data.newLog
      );

      if (!updatedData) {
        throw new Error('Failed to update item data');
      }

      const record = await tx.PipeStock.upsert({
        where: {
          organizationId_size_weight_color: {
            organizationId: data.organization_id,
            size: result.size,
            weight: result.weight,
            color: data.color,
          },
        },
        update: {
          stock: { increment: data.quantity },
        },
        create: {
          size: result.size,
          weight: result.weight,
          color: data.color,
          stock: data.quantity,
          organization: { connect: { id: data.organization_id } },
        },
      });

      let transdata = {
        stockType: "PIPE",
        transactionType: "INWARD",
        organization: { connect: { id: data.organization_id } },
        jobId: result.jobId,
        remainingStock: record.stock,
        quantity: data.quantity,
        stockId: record.id,
        pipeStock: { connect: { id: record.id } },
        note: `Received From ${pipemaker}`,
      };

      await tx.StockTransaction.create({ data: transdata });

      await tx.pipeItem.update({
        where: { id },
        data: updatedData,
      });

      await tx.pipeMakerJob.updateMany({
        where: {
          id: result.jobId,
          totalPipeQty: totalrecieved,
        },
        data: {
          status: 3,
        },
      });

      return record;
    });
  }

  //--------------------   ---------------------------------------------------------/////

  static async Findandupdateitem(
    data,
    colorName,
    receivedQty,
    deliveryLogEntry
  ) {
    const colorObj = data.colorQuantities.find(
      (item) => item.color.name.toLowerCase() === colorName.toLowerCase()
    );

    if (!colorObj) {
      console.log(`Color '${colorName}' not found.`);
      return null;
    }

    colorObj.totalrecieved += receivedQty;

    colorObj.deliverylog.push(deliveryLogEntry);

    return data;
  }

  //-------------------------------------------------  calcualte size wise total recieved pipe ------------------------------------------------------------------------------//

  static calculateSizewise = (item) => {
    return item.colorQuantities.reduce((sum, cq) => sum + cq.totalrecieved, 0);
  };

  static async totalRecievedPipe(pipeItems) {
    return pipeItems.reduce((total, item) => {
      return total + this.calculateSizewise(item);
    }, 0);
  }

  /////----------------------------------------------------------------------------/////

  static async updatejobstatus(id, status) {
    return await Prisma.pipeMakerJob.update({
      where: { id },
      data: { status: status },
    });
  }
}

export default Pipejobmakerservice;
