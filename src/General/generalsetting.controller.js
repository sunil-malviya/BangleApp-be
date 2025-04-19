import Generalservice from "./generalsetting.service.js";

class OptionController {
  // ------------------------nagina master-----------------------------------

  static async getAllOption(req, res) {
    try {
      const record = await Generalservice.getAlloption();

      res.success(record);
    } catch (error) {
      console.log(error);
      res.someThingWentWrong(error);
    }
  }
}

export default OptionController;
