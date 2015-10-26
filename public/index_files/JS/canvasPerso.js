/*jslint node: true */
/*jslint browser: true */
/*jslint devel: true */
/*global WebSocket, Point, Path, paper*/
'use strict';
var ws,
//Initialisation taille Canvas et Cercle
    maxX = 800,
    maxY = 400,
    xInit = 200,
    yInit = 0,
    tailleCercle = 10,
    nbDisqueIni = 8,
    snakes = [],
    obstacles = [],
    couleurs = ["#F0F8FF", "#FAEBD7", "#00FFFF", "#7FFFD4", "#F0FFFF", "#FFE4C4", "#FFEBCD", "#0000FF", "#8A2BE2", "#A52A2A", "#DEB887", "#5F9EA0", "#7FFF00", "#D2691E", "#FF7F50", "#6495ED", "#FFF8DC", "#DC143C", "#00FFFF", "#00008B", "#008B8B", "#B8860B", "#A9A9A9", "#006400", "#BDB76B", "#8B008B", "#556B2F", "#FF8C00", "#9932CC", "#8B0000", "#E9967A", "#8FBC8F", "#483D8B", "#2F4F4F", "#00CED1", "#9400D3", "#FF1493", "#00BFFF", "#696969", "#1E90FF", "#B22222", "#228B22", "#FF00FF", "#FFD700", "#DAA520", "#808080", "#008000", "#ADFF2F", "#FF69B4", "#CD5C5C", "#4B0082", "#F0E68C", "#E6E6FA", "#FFF0F5", "#7CFC00", "#FFFACD", "#ADD8E6", "#F08080", "#FAFAD2", "#90EE90", "#D3D3D3", "#FFB6C1", "#FFA07A", "#20B2AA", "#87CEFA", "#778899", "#B0C4DE", "#00FF00", "#32CD32", "#FAF0E6", "#FF00FF", "#800000", "#66CDAA", "#0000CD", "#BA55D3", "#9370DB", "#3CB371", "#7B68EE", "#00FA9A", "#48D1CC", "#C71585", "#191970", "#FFE4E1", "#FFE4B5", "#FFDEAD", "#000080", "#808000", "#6B8E23", "#FFA500", "#FF4500", "#DA70D6", "#EEE8AA", "#98FB98", "#AFEEEE", "#DB7093", "#FFEFD5", "#FFDAB9", "#CD853F", "#FFC0CB", "#DDA0DD", "#B0E0E6", "#800080", "#FF0000", "#BC8F8F", "#4169E1", "#8B4513", "#FA8072", "#F4A460", "#2E8B57", "#A0522D", "#C0C0C0", "#87CEEB", "#6A5ACD", "#708090", "#00FF7F", "#4682B4", "#D2B48C", "#008080", "#D8BFD8", "#FF6347", "#40E0D0", "#EE82EE", "#F5DEB3", "#FFFF00", "9ACD32"],
    indCouleur = Math.floor(Math.random() * (couleurs.length + 1)),
    indCouleurTete = Math.floor(Math.random() * (couleurs.length + 1)),
    nkInit = 300;

ws = new WebSocket('wss://localhost:3000');


/**
*Fonction qui gère la création d'un disque basiquement, avec x, y et sa couleur
*/
function createCircle(nombre, disques) {
    var xVal,
        yVal,
        colorVal,
        disque;
    
    yInit = Math.random() * (maxY + 1);
    
    // Tête
    if (nombre === 0) {
        xVal = xInit;
        yVal = yInit;
        colorVal = couleurs[indCouleurTete];
    } else {
        // Corps
        xVal = disques[nombre - 1].x - tailleCercle;
        yVal = disques[nombre - 1].y;
        colorVal = couleurs[indCouleur];
    }
    
    
    // Sous format x,y,color
    disque = {
        x : xVal,
        y : yVal,
        color : colorVal
    };
    return disque;
}

/**
* Création du snake complet destiné au serveur
*/
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
        vies : 5,
        score : 0,
        noKill : nkInit
    };
    
    indCouleur = Math.random() * (couleurs.length + 1);
    indCouleurTete = Math.random() * (couleurs.length + 1);
    
    return snake;
}

/**
* Affichage du snake sous Paper
*/
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
            fillColor: newSnake.disques[i].color
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
* Mise à jour des vues
*/
function update(UpSnakes) {
    var is,
        i,
        p = document.getElementsByTagName("table")[0],
        str = "<th><td>Vies</td><td>Score</td></th>";
    
    // Mise à jour des nouvelles coordonnées par le serveur
    for (is = 0; is < UpSnakes.length; is = is + 1) {
        if (snakes[is] !== null && UpSnakes[is] !== null) {
            for (i = 0; i < UpSnakes[is].disques.length; i = i + 1) {
                snakes[is].disques[i].position.x = UpSnakes[is].disques[i].x;
                snakes[is].disques[i].position.y = UpSnakes[is].disques[i].y;
            }
            str = str + "<tr><td>Player " + is + "</td><td>" + UpSnakes[is].vies + "</td><td>" + UpSnakes[is].score + "</td></tr>";
        }
    }
    p.innerHTML = str + "</table>";
    // Update de la vue
    paper.view.update();
}

/**
* Affichage de l'id du joueur courant
*/
function setJoueur(id) {
    var h = document.getElementsByTagName("h3")[0];
    h.innerHTML = h.innerHTML + " " + id;
}

/**
* Affichage des couleurs du snake courant
*/
function setColor(color, id) {
    if (id === 0) {
        document.getElementById("tete").style.backgroundColor = color;
    } else if (id === 1) {
        document.getElementById("carre").style.backgroundColor = color;
    }
}

function setObstacle(obs) {
    var newObs = new Path.Circle({
            center: [obs.x, obs.y],
            radius: obs.rad,
            fillColor: 'black'
        });
    
    obstacles.push(newObs);
    console.log(obs.x);
    console.log(obs.y);
    console.log(obs.rad);
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
        i,
        id,
        color,
        obs;
    
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
    // Affichage dans une box si fin de partie
    } else if (message.data.indexOf("finPartie") !== -1) {
        alert("Vous avez perdu !");
        console.log("mort");
    // Gestion de l'id du joueur courant
    } else if (message.data.indexOf("Player") !== -1) {
        id = message.data.replace("Player", "");
        setJoueur(id);
    // Gestion de la couleur de la tête du snake courant
    } else if (message.data.indexOf("Color0") !== -1) {
        color = message.data.replace("Color0", "");
        setColor(color, 0);
    // Gestion de la couleur du corps du snake courant
    } else if (message.data.indexOf("Color1") !== -1) {
        color = message.data.replace("Color1", "");
        setColor(color, 1);
    } else if (message.data.indexOf("creaObs") !== -1) {
        console.log("ok");
        obs = JSON.parse(message.data.replace("creaObs", ""));
        console.log(obs.x);
        console.log(obs.y);
        console.log(obs.rad);
        setObstacle(obs);
    } else if (message.data.indexOf("delObs") !== -1) {
        obstacles[0].remove();
        obstacles.splice(0, 1);
    } else if (message.data.indexOf("Invincible") !== -1) {
        if (message.data.replace("Invincible", "") === 'O') {
            document.getElementById("inv").innerHTML = "<p> Vous êtes invincible </p>";
            
        } else if (message.data.replace("Invincible", "") === 'N') {
            document.getElementById("inv").innerHTML = "";
            
        } else {
            document.getElementById("inv").innerHTML = "Erreur";
        }
        
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

/* Gestion de la musique */
var player = document.querySelector('#audioPlayer');
player.loop = true;
player.play();
console.log(player);