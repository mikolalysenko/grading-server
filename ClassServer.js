var http = require("http"); 
var url = require("url");
var fs = require("fs");
var ClassDB = require("../ClassDB/ClassDB").ClassDB;
var Dummy = require("../Assignments/Dummy/Dummy");

var ClassServer = function(port, ip, dbPath)
{	
	//TODO log file
	this.db = new ClassDB(dbPath);
	var argPort;
	var argIp;
	this.server;

	//request callback	
	var reqCb = function(req, res)
	{
		console.log("Received request");
		//handle GET
		if(req.method.localeCompare("GET") == 0)
		{
			console.log("Received GET request");
			var urlObj = url.parse(req.url);
			console.log("Request URL path: " + urlObj.path.split("/"));

			if( urlObj.path.localeCompare() == 0 )
			{
				
				var body = "";
				req.on("data",function(chunk){body+=chunk});
				req.on("end", function()
						{
							//data for form:
							// {name, asNum, type, data}
							console.log("body: " + body);
							var reqData = JSON.parse(body);
							switch(reqData.type) 
							{
								case "Score":
									db.getAssignmentScore(reqData.name, reqData.pass, reqData.type, 
										function(err, val)
										{
											if(err)
												sendSimpleResponse(res, err);
											else
												sendSimpleResponse(res, val);
										}
									);
									break;
								case "Src": 
									var reqData = JSON.parse(body);
									db.getAssignmentSrc(reqData.name, reqData.pass, reqData.type, 
										function(err, val)
										{
											if(err)
												sendSimpleResponse(res, err);
											else
												sendSimpleResponse(res, val);
										}
									);
									break;
								default :
									sendSimpleResponse(res, "Bad Request.");
									break;
							}
						}
				);
			}
		}

		//handle OPTIONS request
		if(req.method.localeCompare("OPTIONS") == 0)
		{
			res.writeHead(200, 
					{
						"Content-Length" : 0,
						"Content-Type": "text/plain",
						"Allow": "GET, POST",
						"Access-Control-Allow-Origin" : "*",
						"Access-Control-Allow-Headers": "Content-Type",
						"Access-Control-Allow-Methods": "GET, POST"
					}
			);
			console.log("Sent OPTIONS response");
			res.end();
		}

		//User posting source only
		if(req.method.localeCompare("POST") == 0)
		{
			console.log("Received POST request");
			var body = "";
			req.on("data", function(chunk) 
					{
						console.log("Received new data chunk: " + chunk);
						body += chunk;
					}
			);
			req.on("end", function()
					{
						console.log("Received all of POST data body");
						try //run assingment modules in here, might throw errors, idk
						{
							//data for form:
							// {name, pass, asNum, type, data}
							var reqData = JSON.parse(body);
							this.db.putAssignmentSrc(reqData.name, reqData.pass, reqData.type, reqData.data, 
								function(err)
								{
									if(err)
									{
										sendResponse(res, err);
									}
									else
									{
										var output = Dummy.grade()
										sendResponse(res, output[0]);
									}
								}
							);
						}
						catch(e)
						{
							//basically if json transformation is bad
							var error = String(e);
							sendResponse(res, error);
						}
					}
			);
		}
	}
	//default por/ip
	var argPort = "8082";
	var argIp = "127.0.0.1";
	if(typeof port !== "undefined")
		argPort = port;
	if(typeof ip !== "undefined")
		argIp = ip;
	
	this.server = http.createServer(reqCb);
}

var sendSimpleResponse = function(res, data)
{
	res.writeHead(200, 
			{
				//"Content-Length" : body.length,
				"Content-Length" : Buffer.byteLength(data),
				"Content-Type": "text/plain",
			}
	);
	res.end(data);
}

exports.ClassServer = ClassServer;
