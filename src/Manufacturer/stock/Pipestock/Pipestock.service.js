import Prisma from "./../../../../db/prisma.js";

class PipeStockService {
  // ------------------------worker master-----------------------------------

  static async GetPipeStock(cond, page) {
    return await Prisma.pipeStock.findMany({
      where: cond,
      skip: (page - 1) * 10,
      take: 10,
    });
  }

  static async GetPipeStocktranstion(cond, page) {
    return await Prisma.stockTransaction.findMany({
        where: {
            stockId: cond.stockId,
            stockType: cond.stockType,
            organizationId: cond.organizationId
        },
        skip: (page - 1) * 10,
        take: 10,
    });}
  }

export default PipeStockService;
