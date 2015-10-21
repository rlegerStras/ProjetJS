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

var changeDirection = function (point, i) {
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
};

// Connexion wss, configuration des messages reçus, des connexions et des erreurs
wss.on('connection', function connection(ws) {
	var location = url.parse(ws.upgradeReq.url, true),
        point,
        pointJ,
        i;
    
    // Ajout du nouvel utilisateur au tableau des clients
    clients[ids] = ws;
    ids = ids + 1;

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
            snakes.push(snake);
            
            console.log(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
            console.log("Connexion client", snakes.length - 1);
            
            // Pour tous les clients, envoi du nouveau snake dans un message
            for (i = 0; i < clients.length; i = i + 1) {
                if (clients[i] !== null && clients[i].readyState !== 2) {
                    // Si c'est le nouveau client, alors envoi de tous les snakes présents dans le tableau
                    if (clients[i] === ws) {
                        for (sn = 0; sn < snakes.length - 1; sn = sn + 1) {
                            currentJ = JSON.stringify(snakes[sn]);
                            ws.send("creationSnake" + currentJ);
                        }
                    }
                    clients[i].send("creationSnake" + messageJ);
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
            for (i = 0; i < clients.length; i = i + 1) {
                if (clients[i] !== null && clients[i].readyState !== 2) {
                    if (clients[i] === ws && snakes[i] !== null) {
                        changeDirection(point, i);
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
        for (i = 0; i < clients.length; i = i + 1) {
            if (clients[i] === ws) {
                //Suppression de ses données et message dans le serveur
                clients[i] = null;
                snakes[i] = null;
                d = new Date();
                console.log(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
                console.log('Client ' + i + ' déconnecté.');
                currentDelete = i;
            }
        }
        // Envoi d'un message au client pour la suppression de ce snake
        for (i = 0; i < clients.length; i = i + 1) {
            if (clients[i] !== null && clients[i].readyState !== 2) {
                clients[i].send("delete" + currentDelete);
            }
        }
    });
    
    // Gestion des erreurs
    ws.on('error', function () {
        console.log('ERROR');
    });
	
});

/*Var constantes pour le canvas*/
var maxX = 800,
    maxY = 400,
    tailleCercle = 10;

/**
* Déplacement vers la gauche de l'historique d'un serpent
*/
var decalageHistorique = function (idSerpent, idCorps) {
    var j;
    for (j = 0; j < snakes[idSerpent].histo['corps' + idCorps].length - 1; j = j + 1) {
        snakes[idSerpent].histo['corps' + idCorps][j].x = snakes[idSerpent].histo['corps' + idCorps][j + 1].x;
        snakes[idSerpent].histo['corps' + idCorps][j].y = snakes[idSerpent].histo['corps' + idCorps][j + 1].y;
    }
};

/**
* Calcul de la nouvelle position des snakes (semblable à l'ancien traitement dans onFrame)
*/
var calculNewPosition = function () {
    var si,
        snake,
        j,
        disk;
    
    // Pour tous les serpents
    for (si = 0; si < snakes.length; si = si + 1) {
        snake = snakes[si];
        if (snake !== null) {
            //Pour tous les disques
            for	(j = snake.disques.length - 1; j > -1; j = j - 1) {
                disk = snake.disques[j];
                if (j !== 0) {
                    //On prend la valeur du disque précédent à l'historique de 10 de différence
                    snakes[si].disques[j].x = snake.histo['corps' + (j - 1)][0].x;
                    snakes[si].disques[j].y = snake.histo['corps' + (j - 1)][0].y;
                    
                } else {
                    // Ajoute la direction (entre -1 et 1)
                    snakes[si].disques[j].x = disk.x + snake.directionX;
                    snakes[si].disques[j].y = disk.y + snake.directionY;
                }
                
                // Gestion des sorties du canvas
                if (snakes[si].disques[j].x > maxX) {
                    snakes[si].disques[j].x = 0;
                }

                if (snakes[si].disques[j].x < 0) {
                    snakes[si].disques[j].x = maxX;
                }

                if (snakes[si].disques[j].y > maxY) {
                    snakes[si].disques[j].y = 0;
                }

                if (snakes[si].disques[j].y < 0) {
                    snakes[si].disques[j].y = maxY;
                }
                
                decalageHistorique(si, j);
                
                // Nouvelle position ajoutée à l'historique
                snakes[si].histo['corps' + j][tailleCercle - 1] = {
                    x : disk.x,
                    y : disk.y
                };
            }
        }
    }
};

/**
* Si le joueur touche un autre serpent, sa position est réinitialisée
*/
var reinitialisation = function (idSnake) {
    // Position choisie aléatoirement
    var di,
        initDistanceX = Math.random() * (maxX + 1),
        initDistanceY = Math.random() * (maxY + 1),
        j;
    
    // Recalcul du positionnement des disques
    for (di = 0; di < snakes[idSnake].disques.length; di = di + 1) {
        snakes[idSnake].disques[di].x = initDistanceX;
        snakes[idSnake].disques[di].y = initDistanceY;
        
        // Mise à jour de l'historique
        for (j = 0; j < tailleCercle; j = j + 1) {
            snakes[idSnake].histo['corps' + di][j] = {
                x : snakes[idSnake].disques[di].x + j - tailleCercle + 1,
                y : snakes[idSnake].disques[di].y
            };
        }
        
        // Décalage entre les disques
        initDistanceX = initDistanceX - tailleCercle;
    }
};

/**
* Traitement lorsque deux joueurs se touchent (le premier touche le deuxième)
*/
var touche = function (idAgresseur, idTouche) {
    var i;
    
    console.log(idAgresseur + " a touché " + idTouche + " !");
    // On réinitialise le serpent qui s'est fait ocuhé
    reinitialisation(idAgresseur);
    //Perte d'un vie
    snakes[idAgresseur].vies = snakes[idAgresseur].vies - 1;
    console.log("Vies de " + idAgresseur + " : " + snakes[idAgresseur].vies);
    
    // Si plus de vie, alors envoi d'un message de fin de partie
    if (snakes[idAgresseur].vies < 1) {
        if (clients[idAgresseur] !== null) {
            snakes[idAgresseur] = null;
            clients[idAgresseur].send("finPartie");

            // Envoi de la suppression du serpent
            for (i = 0; i < clients.length; i = i + 1) {
                if (clients[i] !== null && clients[i].readyState !== 2) {
                    clients[i].send("delete" + idAgresseur);
                }
            }
        }
    }
};

/**
* Teste dans tout le jeu s'il y a des collisions
*/
var testDetection = function () {
    var si,
        i,
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
                            
                            // Test mathématique pour les collisions entre deux cercles
                            if (Math.pow(comparativeDisk.x - currentDisk.x, 2) + Math.pow(comparativeDisk.y - currentDisk.y, 2) <= Math.pow(2 * tailleCercle, 2)) {
                                d = new Date();
                                console.log(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
                                
                                // Si la tête du 1er snake a touché l'autre snake
                                if (j === 0) {
                                    touche(si, sii);
                                    if (jj !== 0) {
                                        snakes[sii].score = snakes[sii].score + 1;
                                    }
                                }
                                
                                // Si la tête du 2eme snake a touché l'autre snake
                                if (jj === 0) {
                                    touche(sii, si);
                                    if (j !== 0) {
                                        snakes[si].score = snakes[si].score + 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

/**
* Gestion de l'onFrame précedemment dans le client (ici, 20 ms)
*/
setInterval(function () {
    // Calcul des nouvelles positions
    calculNewPosition();
    var i,
        Jsnakes = JSON.stringify(snakes);
    
    //Pour tous les clients, envoi de la mise à jour des serpents
    for (i = 0; i < clients.length; i = i + 1) {
        if (clients[i] !== null && clients[i].readyState !== 2) {
            clients[i].send("update" + Jsnakes);
        }
    }
    // Test des collisions
    testDetection();
}, 20);

module.exports = {
    changeDirection : changeDirection,
    decalageHistorique : decalageHistorique,
    calculNewPosition : calculNewPosition,
    reinitialisation : reinitialisation,
    touche : touche,
    testDetection : testDetection
};