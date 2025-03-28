import Prisma from "../../db/prisma.js";

class Pipejobmakerservice {
  static async getAlloption() {
    const pipesize = await Prisma.Pipesize.findMany({
      orderBy: {
        ["order"]: "desc",
      },
    });

    const color = await Prisma.color.findMany();

    return { pipesize, color };
  }
}

export default Pipejobmakerservice;
