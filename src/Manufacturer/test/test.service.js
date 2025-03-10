import createDebug from 'debug';
const testDebug = createDebug('manufacturer');


 export async function testMen(request, response) {
  testDebug("test.service -> manufacturer");
    try {
        return response.send("Manufacturer success test");
    }
    catch (error) {
      return response.send("error foinding test");
    }
  };



 