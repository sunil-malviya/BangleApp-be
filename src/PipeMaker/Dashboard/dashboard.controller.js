import Orderservice from "./../order/order.service.js";

class DashboardController {


  static async FetchDashboard(req, res) {
    try {

      const id = req.user.id;
      const totalorder = await Orderservice.getOrdercount({workerOnlineId:id,status: {in: [1, 2,3]}});
      const completeorder = await Orderservice.getOrdercount({workerOnlineId:id,status: 3});
      const pendingorder = await Orderservice.getOrdercount({workerOnlineId:id,status: {in: [1, 2]}});


      res.success({totalorder,completeorder,pendingorder});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async FetchRecentActivity(req, res) {
    try {
      const id = req.user.id;
  
   
      const limit =  3;
  
      const recentorder = await Orderservice.getRecentOrder(
        {
          workerOnlineId: id,
          status: { in: [1,2] },
        },
        limit
      );


      const Productionstatus = await Orderservice.getRecentOrder(
        {
          workerOnlineId: id,
          status: { in: [2] },
        },
        limit
      );


  
      res.success({ recentorder ,Productionstatus});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
  


}

export default DashboardController;
