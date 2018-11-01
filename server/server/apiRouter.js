const router = require('express').Router()
const bodyParser = require("body-parser")
const zerorpc = require("zerorpc");
const ab2str = require('arraybuffer-to-string')
const settings = require("./settings.internal")

router.use(bodyParser.json())

router.post('/', (request, response) => {

    try{
      const method = request.body.method
      const data = request.body.data
	  
	  console.log('method:' + method + '; data=' + data);

      var client = new zerorpc.Client();
      client.connect(settings.system.rpcUrl);

	  
      client.on("error", function(error) {
          console.error("RPC client error:", error);
      });
      
      client.invoke(method, data, function(error, result, more) {
          if(error) {
              console.error(error.message);
              response.send({error: error.message})
          } else {
              response.send({result: ab2str(result)})
          }
      
          if(!more) {
              console.log("Done.");
          }
      });
    }
    catch(error){
        utility.handleError(request, response, error, 'internal_app_error')
    }
})

module.exports = router