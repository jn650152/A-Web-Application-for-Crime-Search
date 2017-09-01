var express = require('express');
var app = express();

var cassandra = require('cassandra-driver');
var PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;
var client = new cassandra.Client({ contactPoints:['35.165.192.95:9042'],keyspace: 'test_db',authProvider: new PlainTextAuthProvider('iccassandra','6ff6a637af15ca024e58dd4742f807f9')});

//Connect to the cluster
//var client = new cassandra.Client({contactPoints: ['35.165.192.95'], keyspace: 'test_db'});

app.get('/index.htm', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
})

app.get('/', function (req, res) {
                           res.write('HTTP 200 OK');
                           res.status(200).end();
})

app.get('/process_get', function (req, res) {
   // Prepare output in JSON format
     var sendDate = (new Date()).getTime();
/*   response = {
      Text_General_Code:req.query.Text_General_Code,
      Dc_Key:req.query.Dc_Key,
      UCR_General: req.query.UCR_General,
      Dc_Dist: req.query.Dc_Dist,
      Psa: req.query.Psa,
      Dispatch_Date: req.query.Dispatch_Date,
      Dispatch_Time: req.query.Dispatch_Time,
      Hour: req.query.Hour,
      Location_Block: req.query.Location_Block,
      Shape: req.query.Shape,
      Police_District: req.query.Shape
   };
*/
     response = {
	Attribute:req.query.Attribute,
	Query_Attribute:req.query.Query_Attribute
     }; 
	var running = 1;
     client.execute('SELECT ' + response.Query_Attribute +' FROM crime WHERE ' + response.Attribute + ' ALLOW FILTERING;'
, function (err, result) {
        console.log('enter function:::::::::::'+err);
           if (!err){
	       var len = result.rows.length; 
               console.log('len = '+len);
               if ( len > 0 ) {
		   for(var i = 0; i < len; i++){
                   	var user = result.rows[i];
                  	console.log( user);
			var test = JSON.stringify(user);
			res.write(test + "\n");
			if(i == len -1){
			   //res.end();//!!!!!!!!!!!!!!!!!!
			   //res.status(200).send('HTTP 200 OK').end();
			   //res.write('HTTP 200 OK');
                           var receiveDate = (new Date()).getTime();
                           res.write(' response time: '+(receiveDate - sendDate)+'ms');
			   res.status(200).end();
			   running = 0;
			}
	           }
		console.log("out of the loop");
		
               } else {
                   console.log("No results");
               }
		var status_set = 0;
           }else{
		var inner_error = "innerErrors";
  		if(err.message.includes(inner_error)){
			res.status(500).send({ error: 'HTTP 500 Internal Server Error'});
		}else{
			res.status(400).send({ error: 'HTTP 400 Bad Request'});
		}
	   }
           // Run next function in series
           //callback(err, null);
       });

})
   var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)

})

