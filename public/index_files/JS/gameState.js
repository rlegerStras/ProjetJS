/*jslint node: true */
'use strict';

var clients = [],
    snakes = [],
    obstacles = [],
    ids = 0;

/*Var constantes pour le canvas*/
var maxX = 800,
    maxY = 400,
    tailleCercle = 10;

/**
* Déplacement vers la gauche de l'historique d'un serpent
*/
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
    return [snakes[i].directionX, snakes[i].directionY];
};

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
    
    if (idTouche === -1) {
        console.log(idAgresseur + " a touché un obstable !");
    } else {
        console.log(idAgresseur + " a touché " + idTouche + " !");
    }
    
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
    } else {
        // On réinitialise le serpent qui s'est fait touché
        reinitialisation(idAgresseur);
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
        comparativeObs,
        d,
        iObs;
    
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
                for (iObs = 0; iObs < obstacles.length; iObs = iObs + 1) {
                    comparativeObs = obstacles[iObs];
                    if (Math.pow(comparativeObs.x - currentDisk.x, 2) + Math.pow(comparativeObs.y - currentDisk.y, 2) <= Math.pow(tailleCercle + comparativeObs.rad, 2)) {
                        d = new Date();
                        console.log(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
                        touche(si, -1);
                    }
                }
            }
        }
    }
};

var manageObstacle = function () {
    var nouvelObst = Math.floor(Math.random() * 500),
        initDistanceX,
        initDistanceY,
        obs,
        i;
    
    if ((nouvelObst === 1 || nouvelObst === 2) && obstacles.length < 10) {
        obs = {
            x : Math.random() * (maxX + 1),
            y : Math.random() * (maxY + 1),
            rad : Math.floor(Math.random() * (50 - 26)) + 25
        };
        obstacles.push(obs);
        console.log(obstacles);
        // Envoi de du nouvel obstacle
        for (i = 0; i < clients.length; i = i + 1) {
            if (clients[i] !== null && clients[i].readyState !== 2) {
                clients[i].send("creaObs" + JSON.stringify(obs));
            }
        }
    } else if (nouvelObst === 3 && obstacles.length > 0) {
        obstacles.splice(0, 1);
        for (i = 0; i < clients.length; i = i + 1) {
            if (clients[i] !== null && clients[i].readyState !== 2) {
                clients[i].send("delObs");
            }
        }
        console.log(obstacles);
    }
};

module.exports = {
    changeDirection : changeDirection,
    decalageHistorique : decalageHistorique,
    calculNewPosition : calculNewPosition,
    reinitialisation : reinitialisation,
    touche : touche,
    testDetection : testDetection,
    manageObstacle : manageObstacle,
    clients : clients,
    snakes : snakes,
    ids : ids,
    obstacles : obstacles
};