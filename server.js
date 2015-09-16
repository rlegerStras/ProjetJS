var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('private/monca.key', 'utf8');
var certificate = fs.readFileSync('private/monca.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

app.use(express.static(__dirname+"/public"));

app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.render(__dirname + 'index');
});

var server     =    httpsServer.listen(3000,function(){
	console.log("Express is running on port 3000");
});
