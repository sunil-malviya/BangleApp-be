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
      }
    });
  }

  static async getManufacturerById(id) {
    return await Prisma.organization.findMany({
      where: { id }
    });
  }

  static async updateManufacturerProfileById(id, data) {
    return await Prisma.organization.update({
      where: { id },
      data: {
        orgLogo: data.orgLogo,
        orgName: data.orgName,
        orgMobile: data.orgMobile,
        orgEmail: data.orgEmail,
        orgPincode: data.orgPincode,
        orgCity: data.orgCity,
        orgState: data.orgState,
        orgAddress: data.orgAddress,
        orgStatus: data.orgStatus,
        orgGST: data.orgGST,
        orgPAN: data.orgPAN,
        orgCIN: data.orgCIN,
        orgTAN: data.orgTAN,
        orgWebsite: data.orgWebsite,
        orgAbout: data.orgAbout,
      },
    });
  }



}

export default userProfileService;
