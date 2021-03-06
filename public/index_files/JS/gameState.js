/*jslint node: true */
'use strict';

/* Var constantes pour le canvas */
var maxX = 800,
    maxY = 400,
    tailleCercle = 10,
    nkInit = 300;

/* Var globales à envoyer au serveur */
var clients = [],
    snakes = [],
    obstacles = [],
    ids = 0,
    bonus = {
        x : 0,
        y : 0,
        size : 0
    };

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
    
    snakes[idSnake].noKill = nkInit;
};

/**
* Intervient quand le bonus est touché. Ajout d'un point et suppression du bonus
*/
var toucheBonus = function (si) {
    var i;
    
    console.log(si + " a attrapé le bonus !");
    // Reinitialisation du bonus
    bonus.size = 0;
    // Ajout d'un point pour le joueur
    snakes[si].score = snakes[si].score + 1;
    
    // Envoi de la suppression du bonus
    for (i = 0; i < clients.length; i = i + 1) {
        if (clients[i] !== null && clients[i].readyState !== 2) {
            clients[i].send("delBonus");
        }
    }
};

/**
* Traitement lorsque deux joueurs se touchent (le premier touche le deuxième)
*/
var touche = function (idAgresseur, idTouche, obs) {
    var i;
    
    if (obs === 1) {
        console.log(idAgresseur + " a touché l'obstacle " + idTouche + " !");
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
        iObs,
        boolTouche;
    
    // Selection du snake courant
    for (si = 0; si < snakes.length; si = si + 1) {
        currentSnake = snakes[si];
        boolTouche = false;
        
        if (currentSnake !== null && currentSnake.noKill === 0) {
            for	(j = currentSnake.disques.length - 1; j > -1; j = j - 1) {
                currentDisk = currentSnake.disques[j];
                
                // Test avec les autres
                for (sii = si + 1; sii < snakes.length; sii = sii + 1) {
                    comparativeSnake = snakes[sii];
                    
                    if (comparativeSnake !== null && comparativeSnake.noKill === 0) {
                        for	(jj = comparativeSnake.disques.length - 1; jj > -1; jj = jj - 1) {
                            comparativeDisk = comparativeSnake.disques[jj];
                            
                            // Test mathématique pour les collisions entre deux cercles
                            
                            if (boolTouche === false) {
                                if (Math.pow(comparativeDisk.x - currentDisk.x, 2) + Math.pow(comparativeDisk.y - currentDisk.y, 2) <= Math.pow(2 * tailleCercle, 2)) {
                                    boolTouche = true;
                                    d = new Date();
                                    console.log("\n" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());

                                    // Si la tête du 1er snake a touché l'autre snake
                                    if (j === 0) {
                                        touche(si, sii, 0);
                                        if (jj !== 0) {
                                            snakes[sii].score = snakes[sii].score + 1;
                                        }
                                    }
                                    
                                    // Si la tête du 2eme snake a touché l'autre snake
                                    if (jj === 0) {
                                        touche(sii, si, 0);
                                        if (j !== 0) {
                                            snakes[si].score = snakes[si].score + 1;
                                        }
                                    }
                                    
                                    // Si ce sont les 2 corps qui se touchent
                                    if (jj !== 0 && j !== 0) {
                                        touche(sii, si, 0);
                                        touche(si, sii, 0);
                                    }
                                }
                            }
                        }
                    }
                }
                // Pour tous les obstacles
                for (iObs = 0; iObs < obstacles.length; iObs = iObs + 1) {
                    comparativeObs = obstacles[iObs];
                    //Si il n'a pas déjà été touché
                    if (boolTouche === false) {
                        if (Math.pow(comparativeObs.x - currentDisk.x, 2) + Math.pow(comparativeObs.y - currentDisk.y, 2) <= Math.pow(tailleCercle + comparativeObs.rad, 2)) {
                            boolTouche = true;
                            d = new Date();
                            console.log("\n" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
                            // Perte de vie et reinitialisation
                            touche(si, iObs, 1);
                        }
                    }
                }
                if (bonus !== null) {
                    if (boolTouche === false) {
                        if (Math.pow(bonus.x - currentDisk.x, 2) + Math.pow(bonus.y - currentDisk.y, 2) <= Math.pow(tailleCercle + bonus.size, 2)) {
                            boolTouche = true;
                            d = new Date();
                            console.log("\n" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.toLocaleTimeString());
                            //Ajout d'un point et redéfinition du bonus
                            toucheBonus(si);
                        }
                    }
                }
            }
        }
    }
};

/**
* Fonction qui permet de créer, supprimer un obstacle selon un nombre aléatoire. (Peut ne rien faire)
*/
var manageObstacle = function () {
    var nouvelObst = Math.floor(Math.random() * 500),
        obs,
        i;
    
    // 2 chances sur 500 de créer un obstacle, et taille maximum de 10 obstacles sur la map
    if ((nouvelObst === 1 || nouvelObst === 2) && obstacles.length < 10) {
        obs = {
            x : Math.random() * (maxX + 1),
            y : Math.random() * (maxY + 1),
            rad : Math.floor(Math.random() * (50 - 26)) + 25
        };
        obstacles.push(obs);
        // Envoi de du nouvel obstacle
        for (i = 0; i < clients.length; i = i + 1) {
            if (clients[i] !== null && clients[i].readyState !== 2) {
                clients[i].send("creaObs" + JSON.stringify(obs));
            }
        }
    // 1 chance sur 500 de supprimer un obstacle
    } else if (nouvelObst === 3 && obstacles.length > 0) {
        obstacles.splice(0, 1);
        for (i = 0; i < clients.length; i = i + 1) {
            if (clients[i] !== null && clients[i].readyState !== 2) {
                clients[i].send("delObs");
            }
        }
    }
};

/**
* Fonction qui permet de créer un bonus s'il n'existe pas
*/
var manageBonus = function () {
    var i;
    
    // Si le bonus n'existe pas
    if (bonus.size === 0) {
        bonus.x = Math.random() * maxX;
        bonus.y = Math.random() * maxY;
        bonus.size = 10;
        
        // Envoi du nouvel obstacle
        for (i = 0; i < clients.length; i = i + 1) {
            if (clients[i] !== null && clients[i].readyState !== 2) {
                clients[i].send("creaBonus" + JSON.stringify(bonus));
            }
        }
    }
};

/**
* Gère si un snake est invincible ou non
*/
var manageNoKill = function () {
    var si;
    // Pour tous les snakes
    for (si = 0; si < snakes.length; si = si + 1) {
        if (snakes[si] !== null) {
            // Mise à jour de la valeur de noKill du snake
            if (snakes[si].noKill !== 0) {
                snakes[si].noKill = snakes[si].noKill - 1;
                
                // Si le client est toujours présent
                if (clients[si] !== null && clients[si].readyState !== 2) {
                    //Si la valeur de noKill est nulle, alors le snake est vulnérable. Si il est positif, il est invincible
                    if (snakes[si].noKill !== 0) {
                        clients[si].send("InvincibleO");
                    } else {
                        clients[si].send("InvincibleN");
                    }
                }
            }
        }
    }
};

/* Envoi au serveur */
module.exports = {
    changeDirection : changeDirection,
    decalageHistorique : decalageHistorique,
    calculNewPosition : calculNewPosition,
    reinitialisation : reinitialisation,
    touche : touche,
    toucheBonus : toucheBonus,
    testDetection : testDetection,
    manageObstacle : manageObstacle,
    manageBonus : manageBonus,
    manageNoKill : manageNoKill,
    clients : clients,
    snakes : snakes,
    ids : ids,
    obstacles : obstacles,
    bonus : bonus
};