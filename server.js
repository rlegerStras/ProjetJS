/*jslint node: true */
'use strict';
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

var clients = [];
var snakes = [];
var ids = 0;

function changeDirection(point, i) {
    //Creation du vecteur
    var vector = {
            x : point.x - snakes[i].disques[0].x,
            y : point.y - snakes[i].disques[0].y
        },
        //Calcul de la norme
        norme = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y)),
        //Vecteur normalisé
        vectorN = {
            x : vector.x / norme,
            y : vector.y / norme
        };

	// Ajout aux directions
	snakes[i].directionX = vectorN.x;
	snakes[i].directionY = vectorN.y;
}

// Connexion wss, configuration des messages reçus
wss.on('connection', function connection(ws) {
	var location = url.parse(ws.upgradeReq.url, true),
        point,
        pointJ,
        i;
    
    clients[ids] = (ws);
    ids = ids + 1;

	ws.on('message', function incoming(message) {
        if (message.indexOf("creation") !== -1) {
            var messageJ = message.replace("creation", ""),
                snake = JSON.parse(messageJ),
                d = new Date(),
                sn,
                currentJ;
            
            snakes.push(snake);
            
            console.log(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
            console.log("Connexion client", snakes.length - 1);
            
            for (i = 0; i < clients.length; i = i + 1) {
                if (clients[i] !== null) {
                    if (clients[i] === ws) {
                        for (sn = 0; sn < snakes.length - 1; sn = sn + 1) {
                            currentJ = JSON.stringify(snakes[sn]);
                            ws.send("creationSnake" + currentJ);
                        }
                    }
                    clients[i].send("creationSnake" + messageJ);
                }
            }
            
        } else if (message.indexOf("clic") !== -1) {
            pointJ = message.replace("clic", "");
            point = JSON.parse(pointJ);
            for (i = 0; i < clients.length; i = i + 1) {
                if (clients[i] !== null) {
                    if (clients[i] === ws) {
                        changeDirection(point, i);
                    }
                }
            }
        }
    });
    
    ws.on('close', function () {
        var currentDelete = -1,
            d;
        for (i = 0; i < clients.length; i = i + 1) {
            if (clients[i] === ws) {
                clients[i] = null;
                snakes[i] = null;
                d = new Date();
                console.log(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
                console.log('Client ' + i + ' déconnecté.');
                currentDelete = i;
            }
        }
        for (i = 0; i < clients.length; i = i + 1) {
            if (clients[i] !== null) {
                clients[i].send("delete" + currentDelete);
            }
        }
    });
    
    ws.on('error', function () {
        console.log('ERROR');
    });
	
});

//Var constantes pour le canvas
var maxX = 1000,
    maxY = 500,
    tailleCercle = 10;

function decalageHistorique(idSerpent, idCorps) {
    var j;
    for (j = 0; j < snakes[idSerpent].histo['corps' + idCorps].length - 1; j = j + 1) {
        snakes[idSerpent].histo['corps' + idCorps][j].x = snakes[idSerpent].histo['corps' + idCorps][j + 1].x;
        snakes[idSerpent].histo['corps' + idCorps][j].y = snakes[idSerpent].histo['corps' + idCorps][j + 1].y;
    }
}

function calculNewPosition() {
    var si,
        snake,
        j,
        disk;
    
    for (si = 0; si < snakes.length; si = si + 1) {
        snake = snakes[si];
        if (snake !== null) {
            for	(j = snake.disques.length - 1; j > -1; j = j - 1) {
                disk = snake.disques[j];
                if (j !== 0) {
                    //On prend la valeur du disque précédent à l'historique de 10
                    snakes[si].disques[j].x = snake.histo['corps' + (j - 1)][0].x;
                    snakes[si].disques[j].y = snake.histo['corps' + (j - 1)][0].y;
                    
                } else {
                    // Ajoute la direction (entre -1 et 1)
                    snakes[si].disques[j].x = disk.x + snake.directionX;
                    snakes[si].disques[j].y = disk.y + snake.directionY;
                }

                if (snakes[si].disques[j].x > 1000) {
                    snakes[si].disques[j].x = 0;
                }

                if (snakes[si].disques[j].x < 0) {
                    snakes[si].disques[j].x = 1000;
                }

                if (snakes[si].disques[j].y > 500) {
                    snakes[si].disques[j].y = 0;
                }

                if (snakes[si].disques[j].y < 0) {
                    snakes[si].disques[j].y = 500;
                }
                
                decalageHistorique(si, j);

                snakes[si].histo['corps' + j][tailleCercle - 1] = {
                    x : disk.x,
                    y : disk.y
                };
            }
        }
    }
}

function reinitialisation(idSnake) {
    var di,
        initDistanceX = Math.random() * (maxX + 1),
        initDistanceY = Math.random() * (maxY + 1),
        j;
    
    for (di = 0; di < snakes[idSnake].disques.length; di = di + 1) {
        snakes[idSnake].disques[di].x = initDistanceX;
        snakes[idSnake].disques[di].y = initDistanceY;
        
        for (j = 0; j < tailleCercle; j = j + 1) {
            snakes[idSnake].histo['corps' + di][j] = {
                x : snakes[idSnake].disques[di].x + j - tailleCercle + 1,
                y : snakes[idSnake].disques[di].y
            };
        }
        snakes[idSnake].directionX = 1;
        snakes[idSnake].directionY = 0;
        
        initDistanceX = initDistanceX - tailleCercle;
    }
}

function testDetection() {
    var si,
        j,
        currentSnake,
        currentDisk,
        sii,
        jj,
        comparativeSnake,
        comparativeDisk,
        d;
    
    // Selection du snake courant
    for (si = 0; si < snakes.length; si = si + 1) {
        currentSnake = snakes[si];
        
        if (currentSnake !== null) {
            for	(j = currentSnake.disques.length - 1; j > -1; j = j - 1) {
                currentDisk = currentSnake.disques[j];
                
                // Test avec les autres
                for (sii = si + 1; sii < snakes.length; sii = sii + 1) {
                    comparativeSnake = snakes[sii];
                    
                    if (comparativeSnake !== null) {
                        for	(jj = comparativeSnake.disques.length - 1; jj > -1; jj = jj - 1) {
                            comparativeDisk = comparativeSnake.disques[jj];
                            
                            if (Math.pow(comparativeDisk.x - currentDisk.x, 2) + Math.pow(comparativeDisk.y - currentDisk.y, 2) <= Math.pow(2 * tailleCercle, 2)) {
                                d = new Date();
                                console.log(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
                                
                                // Si la tête du 1er snake a touché l'autre snake
                                if (j === 0) {
                                    console.log(si + " a touché " + sii + " !");
                                    reinitialisation(si);
                                    snakes[si].vies = snakes[si].vies - 1;
                                    console.log("Vies de " + si + " : " + snakes[si].vies);
                                }
                                
                                // Si la tête du 2eme snake a touché l'autre snake
                                if (jj === 0) {
                                    console.log(sii + " a touché " + si + " !");
                                    reinitialisation(sii);
                                    snakes[sii].vies = snakes[sii].vies - 1;
                                    console.log("Vies de " + sii + " : " + snakes[sii].vies);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}


setInterval(function () {
    calculNewPosition();
    var i,
        Jsnakes;
    
    for (i = 0; i < clients.length; i = i + 1) {
        if (clients[i] !== null) {
            Jsnakes = JSON.stringify(snakes);
            clients[i].send("update" + Jsnakes);
        }
    }
    testDetection();
}, 20);