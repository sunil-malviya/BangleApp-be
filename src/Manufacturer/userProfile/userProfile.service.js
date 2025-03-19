import Prisma from './../../../db/prisma.js';

class designservice {

  static async createDesign(data) {
    return await Prisma.Design.create({ data });
  }

  static async getAllDesigns({ page = 1, pageSize = 10, orderBy = "name", order = "desc", filters = {} }) {
    return await Prisma.Design.findMany({
      where: filters, // Apply conditions
      skip: (page - 1) * pageSize, // Pagination logic
      take: pageSize, // Number of items per page
      orderBy: {
        [orderBy]: order, // Ordering logic
      },
    });
  }
  
  static async getDesignById(id) {
    return await Prisma.Design.findUnique({ where: { id } });
  }

  static async updateDesign(id, data) {
    return await Prisma.Design.update({ where: { id }, data });
  }

  static async deleteDesign(id) {
    return await Prisma.Design.delete({ where: { id } });
  }
}

export default designservice;
