/*jslint node: true */
/*jslint browser: true */
/*jslint devel: true */
/*global WebSocket, Point, Path, paper*/
'use strict';
var ws,
//Initialisation taille Canvas et Cercle
    maxX = 1000,
    maxY = 500,
    xInit = 200,
    yInit = 0,
    tailleCercle = 10,
    nbDisqueIni = 8,
    snakes = [];

ws = new WebSocket('wss://localhost:3000');

function createCircle(nombre, disques) {
    var xVal,
        yVal,
        colorVal,
        disque;
    
    yInit = Math.random() * (maxY + 1);
    
    console.log(snakes.length);
    // Tête
    if (nombre === 0) {
        xVal = xInit;
        yVal = yInit;
        colorVal = 'green';
    } else {
        // Corps
        xVal = disques[nombre - 1].x - tailleCercle;
        yVal = disques[nombre - 1].y;
        colorVal = 'blue';
    }
    // Sous format x,y,color
    disque = {
        x : xVal,
        y : yVal,
        color : colorVal
    };
    return disque;
}

function createSnakeServer() {
    var directionX = 1,
        directionY = 0,
        histo = {},
        disques = [],
        i,
        disk,
        d,
        j,
        snake,
        maxHisto = 10;
    
    // Création de tous les disques
    for	(i = 0; i < nbDisqueIni; i = i + 1) {
        // Création de l'historique
        histo['corps' + i] = [];
        // Création du disque
        disk = createCircle(i, disques);
        // Ajout dans la liste
        disques.push(disk);
        // Initialisation de l'historique
        for (j = 0; j < maxHisto; j = j + 1) {
            histo['corps' + i].push({
                x : disk.x + j - maxHisto + 1,
                y : disk.y
            });
        }
    }
    
    // Création du snake
    snake = {
        disques : disques,
        histo : histo,
        directionX : directionX,
        directionY : directionY,
        vies : 1
    };
    
    return snake;
}

// Affichage du snake sous Paper
function createSnakePaper(newSnake) {
    var disques = [],
        disque,
        i,
        snake;
    
    // Pour tout le corps, affichage de chaque disque
    for (i = 0; i < newSnake.disques.length; i = i + 1) {
        disque = new Path.Circle({
            center: [newSnake.disques[i].x, newSnake.disques[i].y],
            radius: tailleCercle,
            fillColor: newSnake.disques[i].color,
            strokeColor: 'black'
        });
        disques.push(disque);
    }
    // Ajout en variable globale (dans snakes)
    snake = {
        disques : disques
    };
    snakes.push(snake);
}

/**
Mise à jour des vues
*/
function update(UpSnakes) {
    var is,
        i,
        p = document.getElementsByTagName("p")[0],
        str = "Scores : <br/>";
    
    // Mise à jour des nouvelles coordonnées par le serveur
    for (is = 0; is < UpSnakes.length; is = is + 1) {
        if (snakes[is] !== null && UpSnakes[is] !== null) {
            for (i = 0; i < UpSnakes[is].disques.length; i = i + 1) {
                snakes[is].disques[i].position.x = UpSnakes[is].disques[i].x;
                snakes[is].disques[i].position.y = UpSnakes[is].disques[i].y;
            }
            str = str + "Utilisateur " + is + " : " + UpSnakes[is].vies + " vies<br/>";
        }
    }
    p.innerHTML = str;
    // Update de la vue
    paper.view.update();
}

/**
Ouverture de session
*/
ws.onopen = function () {
    // Créé le nouveau snake (les disques initialisés)
    var snake = createSnakeServer(),
        Jsnake = JSON.stringify(snake);  //JSON
    ws.send("creation" + Jsnake);
};

/**
Reception de message
*/
ws.onmessage = function (message) {
    var messageJ,
        newSnake,
        upSnakes,
        currentDelete,
        i;
    
    // Création du snake vers le serveur
    if (message.data.indexOf("creationSnake") !== -1) {
        messageJ = message.data.replace("creationSnake", "");
        if (messageJ !== "null") {
            newSnake = JSON.parse(messageJ);
            createSnakePaper(newSnake);
        } else {
            snakes.push(null);
        }
    // MAJ de la vue
    } else if (message.data.indexOf("update") !== -1) {
        messageJ = message.data.replace("update", "");
        upSnakes = JSON.parse(messageJ);
        update(upSnakes);
    // Suppression d'un serpent
    } else if (message.data.indexOf("delete") !== -1) {
        
        currentDelete = message.data.replace("delete", "");
        
        // Suppression de la visibilité des disques
        for (i = 0; i < snakes[currentDelete].disques.length; i = i + 1) {
            snakes[currentDelete].disques[i].remove();
        }
        
        snakes[currentDelete] = null;
    } else if (message.data.indexOf("finPartie") !== -1) {
        alert("Vous avez perdu !");
    }
};

/**
 Clic souris dans canvas
*/
function onMouseDown(event) {
    
    var point = {
            x : event.point.x,
            y : event.point.y + 0.59375
        },
        Jpoint = JSON.stringify(point);

    // envoi de message au serveur
    ws.send('clic' + Jpoint);
}

/*//Music
var player = document.querySelector('#audioPlayer');
player.play();
*/