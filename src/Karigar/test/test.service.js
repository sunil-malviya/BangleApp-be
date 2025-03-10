import createDebug from 'debug';
const testDebug = createDebug('karigar');


 export async function testKarigar(request, response) {
  testDebug("test.service -> karigar");
    try {
        return response.send("karigar success test");
    }
    catch (error) {
      return response.send("error foinding test");
    }
  };

