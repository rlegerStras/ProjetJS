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

// Création des serveurs
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// Ajout des pages dans le dossier "public"
app.use(express.static(__dirname+"/public"));

// Réponse du serveur si demande de page
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.render(__dirname + 'index');
});

// Réponse du serveur si lancé
var server     =    httpsServer.listen(3000,function(){
	console.log("Express is running on port 3000");
});
