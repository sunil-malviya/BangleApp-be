import Prisma from "../../db/prisma.js";

class Pipejobmakerservice {
  static async getAlloption() {
    const pipesize = await Prisma.Pipesize.findMany({
      orderBy: {
        ["order"]: "desc",
      },
    });

    const color = await Prisma.color.findMany();
    
    const Pipeweight = await Prisma.PipeWeight.findMany();
        
    const PipeMaterail = await Prisma.Material.findMany();
    const Lotsize = await Prisma.Lotsize.findMany();


    return { pipesize, color,Pipeweight,PipeMaterail,Lotsize };
  }
}

export default Pipejobmakerservice;
