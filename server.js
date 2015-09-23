// Requirements obligatoires
var fs = require('fs');
var http = require('http');
var https = require('https');

// Lit le certificat et la clé
var privateKey  = fs.readFileSync('private/monca.key', 'utf8');
var certificate = fs.readFileSync('private/monca.crt', 'utf8');

// Associe la clé et le certificat
var credentials = {key: privateKey, cert: certificate};

// Ajout de express, et lancement
var express = require('express');
var app = express();

// Création du serveur https
var httpsServer = https.createServer(credentials, app);

// Ajout des pages dans le dossier "public"
app.use(express.static(__dirname+"/public"));

// Création du serveur WS
var server = httpsServer,
			url = require('url'),
			WebSocketServer = require('ws').Server,
			wss = new WebSocketServer({ server: server}),
			express,
			app,
			port = 3000;

// Réponse du serveur si lancé
server.listen(port, function()
{
	console.log('Listening on ' + server.address().port)
});

// Connexion wss, configuration des messages reçus
wss.on('connection', function connection(ws) {
	var location = url.parse(ws.upgradeReq.url, true);

	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
		ws.send("connexion accepted");
    });
	
	setInterval( function()
	{
		ws.send("essai TimeOut");
	}, 2000);
});