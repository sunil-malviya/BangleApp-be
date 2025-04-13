import applicationSettingService from './applicationSettings.service.js';

class applicationSettingsController {
  // -----------------------------------------------------------

  static async getPDFSettings(req, res) {
    const organizationId  = req.user.organization.id;
    const orgType = req.user.organization.orgType;
    const pdfSettingData  = req.body;
    const settingsType = 'PDF';       
   
    try {
      const record = await applicationSettingService.getPDFSetting(organizationId);
      console.log('record', record);

      res.success(record);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }

  static async postPDFSettings(req, res) {
    const organizationId  = req.user.organization.id;
    const orgType = req.user.organization.orgType;
    const pdfSettingData  = req.body;
    const settingsType = 'PDF';       

    try {
      const record = await applicationSettingService.postPDFSetting(organizationId,orgType,settingsType,pdfSettingData);
      res.success(record);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
  // -----------------------------------------------------------
  


  static async updatePdfSettings(req, res) {
    console.log('updatePdfSettings',req.user);
    const organizationId  = req.user.organization.id;
    const orgType = req.user.organization.orgType;
    const pdfSettingData  = req.body;
    const settingsType = 'PDF';       
    
    try {
      const record = await applicationSettingService.updatePdfSetting( organizationId,orgType,settingsType,pdfSettingData);
      console.log('record', record);
      if (record.status === false) {
        return res.json({
          status: false,
          message: record.message,
        });
      }
      
      return res.json({
        status: true,
        message: "PDF Setting updated successfully",
        data: record,
      });
       
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }


}

export default applicationSettingsController;
