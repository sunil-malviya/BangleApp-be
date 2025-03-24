import Prisma from './../../../db/prisma.js';

class designservice {

  static async createDesign(data) {
    return await Prisma.design.create({ data });
  }

  static async getAllDesigns({ page = 1, pageSize = 8, orderBy = "name", order = "desc", filters = {} }) {
    return await Prisma.design.findMany({
      where: filters, // Apply conditions
      skip: (page - 1) * pageSize, // Pagination logic
      take: pageSize, // Number of items per page
      orderBy: {
        [orderBy]: order, // Ordering logic
      },
    });
  }
  
  static async getDesignById(id) {
    return await Prisma.design.findUnique({ where: { id } });
  }

  static async updateDesign(id, data) {
    return await Prisma.design.update({ where: { id }, data });
  }

  static async deleteDesign(id) {
    return await Prisma.design.delete({ where: { id } });
  }




  static async getDesignByIds(ids) {
    return await Prisma.design.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
  
}

export default designservice;
