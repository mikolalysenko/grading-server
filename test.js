var ClassServer = require("./ClassServer").ClassServer;

//server test
//var classServer = new ClassServer(8080, "198.58.110.221");
var classServer = new ClassServer();
classServer.db.addNewStudent("alex","password",
	function(err){if(err)console.log("fuck")});
classServer.server.listen(8082, "127.0.0.1");

