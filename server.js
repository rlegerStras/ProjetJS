/*jslint node: true */
'use strict';
// Requirements obligatoires
var fs = require('fs');
var http = require('http');
var https = require('https');
var gameState = require('./public/index_files/JS/gameState');

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
/*jslint nomen: true*/
var str = __dirname + "/public";
/*jslint nomen: false*/
var a = express['static'](str);
app.use(a);

// Création du serveur WS
var server = httpsServer,
    url = require('url'),
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ server: server}),
    express,
    app,
    port = 3000;

// Réponse du serveur si lancé
server.listen(port, function () {
	console.log('Démarrage du serveur sur le port ' + server.address().port);
});

// Connexion wss, configuration des messages reçus, des connexions et des erreurs
wss.on('connection', function connection(ws) {
	var location = url.parse(ws.upgradeReq.url, true),
        point,
        pointJ,
        i;
    
    // Ajout du nouvel utilisateur au tableau des clients
    gameState.clients[gameState.ids] = ws;
    gameState.ids = gameState.ids + 1;

    //Réception d'un message
	ws.on('message', function incoming(message) {
        // Si message de création
        if (message.indexOf("creation") !== -1) {
            // Suppression de la premiere partie du message, nouveau snake extrait
            var messageJ = message.replace("creation", ""),
                snake = JSON.parse(messageJ),
                d = new Date(),
                sn,
                currentJ;
            
            // Ajout du snake au tableau global
            gameState.snakes.push(snake);
            
            console.log(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
            console.log("Connexion client", gameState.snakes.length - 1);
            
            // Pour tous les clients, envoi du nouveau snake dans un message
            for (i = 0; i < gameState.clients.length; i = i + 1) {
                if (gameState.clients[i] !== null && gameState.clients[i].readyState !== 2) {
                    // Si c'est le nouveau client, alors envoi de tous les snakes présents dans le tableau
                    if (gameState.clients[i] === ws) {
                        for (sn = 0; sn < gameState.snakes.length - 1; sn = sn + 1) {
                            currentJ = JSON.stringify(gameState.snakes[sn]);
                            ws.send("creationSnake" + currentJ);
                        }
                        console.log(gameState.obstacles);
                        for (sn = 0; sn < gameState.obstacles.length - 1; sn = sn + 1) {
                            currentJ = JSON.stringify(gameState.obstacles[sn]);
                            ws.send("creaObs" + currentJ);
                        }
                    }
                    gameState.clients[i].send("creationSnake" + messageJ);
                }
            }
            
            // Envoi du numéro du joueur, couleur de tête et couleur du ventre
            ws.send("Player" + (i - 1));
            ws.send("Color0" + snake.disques[0].color);
            ws.send("Color1" + snake.disques[1].color);
            
        // Si clic souris
        } else if (message.indexOf("clic") !== -1) {
            // Suppression du texte en trop
            pointJ = message.replace("clic", "");
            point = JSON.parse(pointJ);
            // Modification de la nouvelle direction au client du snake modifié
            for (i = 0; i < gameState.clients.length; i = i + 1) {
                if (gameState.clients[i] !== null && gameState.clients[i].readyState !== 2) {
                    if (gameState.clients[i] === ws && gameState.snakes[i] !== null) {
                        gameState.changeDirection(point, i);
                    }
                }
            }
        }
    });
    
    // Fermeture de session
    ws.on('close', function () {
        var currentDelete = -1,
            d;
        //On cherche le client dans le tableau
        for (i = 0; i < gameState.clients.length; i = i + 1) {
            if (gameState.clients[i] === ws) {
                //Suppression de ses données et message dans le serveur
                gameState.clients[i] = null;
                gameState.snakes[i] = null;
                d = new Date();
                console.log(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
                console.log('Client ' + i + ' déconnecté.');
                currentDelete = i;
            }
        }
        // Envoi d'un message au client pour la suppression de ce snake
        for (i = 0; i < gameState.clients.length; i = i + 1) {
            if (gameState.clients[i] !== null && gameState.clients[i].readyState !== 2) {
                gameState.clients[i].send("delete" + currentDelete);
            }
        }
    });
    
    // Gestion des erreurs
    ws.on('error', function () {
        console.log('ERROR');
    });
	
});

/**
* Gestion de l'onFrame précedemment dans le client (ici, 20 ms)
*/
setInterval(function () {
    // Calcul des nouvelles positions
    gameState.calculNewPosition();
    var i,
        Jsnakes = JSON.stringify(gameState.snakes);
    
    //Pour tous les clients, envoi de la mise à jour des serpents
    for (i = 0; i < gameState.clients.length; i = i + 1) {
        if (gameState.clients[i] !== null && gameState.clients[i].readyState !== 2) {
            gameState.clients[i].send("update" + Jsnakes);
        }
    }
    gameState.manageObstacle();
    
    // Test des collisions
    gameState.testDetection();
    
    gameState.manageNoKill();
    if (gameState.snakes.length > 0) {
        console.log(gameState.snakes[0].noKill);
    }
}, 20);