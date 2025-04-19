import Prisma from "../../db/prisma.js";

class applicationSettingService {

  static async getPDFSetting(organizationId) {
    const getPDFSetting = await Prisma.applicationSettings.findMany({
      where: {
        organizationId: String(organizationId), 
      }
    });
    return getPDFSetting;
  }

  static async postPDFSetting(organizationId,orgType,settingsType,pdfSettingData) {
   
    const getPDFSetting = await Prisma.applicationSettings.create({
      data: {
        organizationId: String(organizationId),
        orgType: orgType,
        settingsType: settingsType,
        settings: pdfSettingData,
      }
    });
    return getPDFSetting;
  }


  static async updatePdfSetting(organizationId,orgType,settingsType,pdfSettingData) {

    const existPDFSetting = await Prisma.applicationSettings.findFirst({
      where: {
        organizationId: String(organizationId),
        orgType: orgType,
        settingsType: settingsType,
      }
    });
    if (!existPDFSetting) {
    return resizeBy.json({
        status: false,
        message: "PDF Setting not found",
      });
    }
    const getPDFSetting = await Prisma.applicationSettings.update({
      where: {
        id: String(existPDFSetting.id),
        organizationId: String(organizationId),
        orgType: orgType,
        settingsType: settingsType,
      },
      data: {     
        settings: pdfSettingData,
      }
    });
    return getPDFSetting;
  }





}

export default applicationSettingService;
