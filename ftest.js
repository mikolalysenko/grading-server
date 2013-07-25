var http = require("http");

var serv = http.createServer(function(req, res){console.log("wtf")});
serv.listen(8082, "127.0.0.1");
