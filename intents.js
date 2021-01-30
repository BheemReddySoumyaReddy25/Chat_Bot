
const { Payload } =require("dialogflow-fulfillment");
var randomString = require("randomstring");
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://127.0.0.1:27017";
const dbName = 'service';
let db;

MongoClient.connect(url, { useUnifiedTopology: true ,useNewUrlParser: true}, (err, client) => {
    if (err) return console.log(err);
    db = client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);

});

var user_name = "";
async function identify_user(agent){
        const acc_num = agent.parameters['acc_num'];
        console.log(acc_num);
        var user = await db.collection("user_table").findOne({"acc_num":acc_num});
        console.log(user);
        if(user==null){
             await agent.add("Re-Enter your account number");
        }
        else{
            user_name = user.username;
            await agent.add("Welcome "+user_name+"!! \n How can I help you");
        }
}
function report_issue(agent){
        var issue_vals = {1:"Internet Down",2:"Slow Internet",3:"Buffering problem",4:"No connectivity"};
        const intent_val = agent.parameters['issue_num'];
        var val = issue_vals[intent_val];
        var trouble_ticket = randomString.generate(7);
        var status = "pending";
        let date_ob = new Date();
        var date = date_ob.getDate()+"-"+(date_ob.getMonth()+1)+"-"+date_ob.getFullYear();
        var query = {"username":user_name,"issue":val,"status":status,"date":date,"trouble_ticket":trouble_ticket};
        db.collection("user_issues").insertOne(query,(err,res)=>{
            if (err)
                throw err;
            console.log("1 item inserted");    
        });
        agent.add("The issue reported is : "+val+"\nThe Ticket number is: "+trouble_ticket);
}
function custom_payload(agent){
      var payLoadData=
        {
        "richContent": [
          [
            {
              "type": "list",
              "title": "Internet Down",
              "subtitle": "Press '1' for Internet is down",
              "event": {
                "name": "",
                "languageCode": "",
                "parameters": {}
              }
            },
            {
              "type": "divider"
            },
            {
              "type": "list",
              "title": "Slow Internet",
              "subtitle": "Press '2' Slow Internet",
              "event": {
                "name": "",
                "languageCode": "",
                "parameters": {}
              }
            },
          {
              "type": "divider"
            },
          {
              "type": "list",
              "title": "Buffering problem",
              "subtitle": "Press '3' for Buffering problem",
              "event": {
                "name": "",
                "languageCode": "",
                "parameters": {}
              }
            },
            {
              "type": "divider"
            },
            {
              "type": "list",
              "title": "No connectivity",
              "subtitle": "Press '4' for No connectivity",
              "event": {
                "name": "",
                "languageCode": "",
                "parameters": {}
              }
            }
          ]
        ]
    }
    agent.add(new Payload(agent.UNSPECIFIED,payLoadData,{sendAsMessage:true, rawPayload:true }));
}

function register(agent){
    console.log("Taking username and phone number");
    var name = agent.parameters.person.name;
    var acc_num = agent.parameters['acc_num'];
    console.log(`Username is : ${name}`);
    console.log(`Phone number is : ${acc_num}`);
    var query = {"username":name,"acc_num":acc_num};
    db.collection("user_table").insertOne(query,(err,res)=>{
        if (err)
            throw err;
        console.log("1 item inserted");    
    });
    agent.add("Successfully Registered. Please use this account number : "+acc_num +" for further conversation");
}
module.exports = {identify_user:identify_user,report_issue:report_issue,custom_payload:custom_payload,register:register};