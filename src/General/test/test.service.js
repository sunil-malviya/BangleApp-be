import createDebug from 'debug';
const testDebug = createDebug('agent');


 export async function agentTest(req, res) {
  testDebug("test.service -> agent");
    try {
      let data = {}
      res.sendResponse(data, "Operation successful");
    }
    catch (error) {
      console.log(error)
      res.sendError("agent test error >>>>>>>>>");
    }
  };

