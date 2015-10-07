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

var clients = [];
var snakes = [];
var ids = 0;

// Connexion wss, configuration des messages reçus
wss.on('connection', function connection(ws) {
	var location = url.parse(ws.upgradeReq.url, true);
    clients[ids] = (ws);
    ids++;

	ws.on('message', function incoming(message) {
        if(message.indexOf("creation") != -1 )
        {
            messageJ = message.replace("creation","");
            snake = JSON.parse(messageJ);
            snakes.push(snake);
            ws.send("creationSnake"+messageJ);
        }
        else if(message.indexOf("clic") != -1 )
        {
            pointJ = message.replace("clic","");
            point = JSON.parse(pointJ);
            for (i=0;i<clients.length;i++)
            {
                if(clients[i] == ws)
                {
                    changeDirection(point,i);
                }
            }
        }
    });
    
    ws.on('close', function() {
        for (i=0;i<clients.length;i++)
        {
            if(clients[i] == ws)
            {
                clients[i] = null;
                snakes[i] = null;
                console.log('Client '+i+' disconnected.');
            }
        }
    });
    
    ws.on('error', function() {
        console.log('ERROR');
    });
	
});

//Var constantes pour le canvas
const maxX = 1000;
const maxY = 500;
const tailleCercle = 10;

setInterval( function()
{
    //d = new Date();
    //console.log(d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" "+d.toLocaleTimeString());
    calculNewPosition();
    
    for (i=0;i<clients.length;i++)
    {
        if(clients[i] != null)
        {
            console.log("Client "+i+" still alive");
            Jsnakes = JSON.stringify(snakes);  
            clients[i].send("update"+Jsnakes);
        }
    }
}, 10000);

function calculNewPosition()
{
    for (si = 0 ; si < snakes.length ; si++)
    {
        snake = snakes[si];
        if(snake != null)
        {
            for	(j = snake.disques.length-1; j > -1; j--)
            {
                disk = snake.disques[j];
                if(j != 0)
                {
                    snakes[si].disques[j].x = snake.histo['corps'+(j-1)][snake['count']-tailleCercle].x;
                    snakes[si].disques[j].y = snake.histo['corps'+(j-1)][snake['count']-tailleCercle].y;
                }
                else
                {
                    // Ajoute la direction (entre -1 et 1)
                    snakes[si].disques[j].x = disk.x + snake['directionX'];
                    snakes[si].disques[j].y = disk.y + snake['directionY'];
                }

                if(snakes[si].disques[j].x > 1000)
                    snakes[si].disques[j].x = 0;

                if(snakes[si].disques[j].x < 0)
                    snakes[si].disques[j].x = 1000;

                if(snakes[si].disques[j].y > 500)
                    snakes[si].disques[j].y = 0;

                if(snakes[si].disques[j].y < 0)
                    snakes[si].disques[j].y = 500;

                snakes[si].histo['corps'+j].push(
                    {
                        x : disk.x,
                        y : disk.y
                    });
            }
            snakes[si].count++;
            console.log(snakes[si].count);
        }
    }   
}

function changeDirection(point,i)
{
    //Creation du vecteur
    vector = 
        {
            x : point.x - snakes[i].disques[0].x,
            y : point.y - snakes[i].disques[0].y
        }
    
    //Calcul de la norme
    norme = Math.sqrt((vector.x*vector.x)+(vector.y*vector.y));
    
    //Vecteur normalisé
    vectorN = 
        {
            x : vector.x/norme,
            y : vector.y/norme
        }
	
	// Ajout aux directions
	snakes[i].directionX = vectorN.x;
	snakes[i].directionY = vectorN.y;
}