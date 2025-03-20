import Prisma from './../../../db/prisma.js';

class userProfileService {

  static async getUserById(id) {
    return await Prisma.user.findMany({
      where: { id }
    });
  }

  static async updateProfileById(id, data) {
    return await Prisma.user.update({
      where: { id },
      data: {
        fullName: data.name,
        email: data.email,
        image: data.image,
        organization: {
          update: {
            orgAddress: data.address, // ✅ Organization ka address bhi update hoga
          },
        },
      },
      include: {
        organization: true, // ✅ Updated organization data return karega
      },
    });
  }





}

export default userProfileService;
