import createDebug from 'debug';
const testDebug = createDebug('pipe-maker');


export async function testPipeMaker(request, response) {
    testDebug("test.service -> pipe-maker");
    try {
        return response.send("Pipe Maker success test");
    }
    catch (error) {
      return response.send("error foinding test");
    }
  };

