const express = require("express");
const {WebhookClient} = require("dialogflow-fulfillment");


const app = express();
var path = require('path'); 
//bodyparser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var {identify_user,report_issue,custom_payload,register} = require("./intents");
app.get('/', function(req, res){ 
  var options = { 
      root: path.join(__dirname) 
  }; 
    
  var fileName = 'index.html'; 
  res.sendFile(fileName, options, function (err) { 
      if (err) { 
          next(err); 
      } else { 
          console.log('Sent:', fileName); 
      } 
  }); 
}); 

app.post('/',(req,res)=>{
    const agent = new WebhookClient({ 
		request: req, response: res 
		});

    var intentMap = new Map();
    intentMap.set("service_intent", identify_user);
    intentMap.set("Default Welcome Intent - no - custom",register);
    intentMap.set("service_intent-custom", custom_payload);
    intentMap.set("service_intent-custom-custom", report_issue);

    agent.handleRequest(intentMap);
});

app.listen(8080);