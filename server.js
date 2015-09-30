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
        }
        else if(message.indexOf("clic") != -1 )
        {
            point = message.replace("clic","");
            console.log(point);
            for (i=0;i<clients.length;i++)
            {
                if(clients[i] == ws)
                {
                    changeDirection(point,i);
                }
            }
        }
        
        /*
        if(message == 'connexion client')
        {
            console.log('received: %s', message);
            ws.send("connexion accepted");
        }
		else if(message == 'clic')
        {
            for (i=0;i<clients.length;i++)
            {
                if(clients[i] != null)
                {
                    clients[i].send("update");
                    console.log("clic");
                }
            }
        }
        */
    });
    
    ws.on('close', function() {
        for (i=0;i<clients.length;i++)
        {
            if(clients[i] == ws)
            {
                clients[i] = null;
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
    d = new Date();
    //console.log(d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" "+d.toLocaleTimeString());
    
    for (i=0;i<clients.length;i++)
    {
        if(clients[i] != null)
        {
            //console.log("Client "+i+" still alive");
            //clients[i].send("update");
        }
    }
}, 20);

function calculNewPosition()
{
    for (si = 1 ; si < snakes.length ; si++)
    {
        snake = snakes[si];
        
        for	(i = snake.disques.length-1; i > -1; i--)
        {
            disk = snake.disques[i]
            if(i != 0)
            {
                snakes[si].disques[i].position.x = snake['histo']['corps'+(i-1)][snake['count']-tailleCercle].x;
                snakes[si].disques[i].position.y = snake['histo']['corps'+(i-1)][snake['count']-tailleCercle].y;
            }
            else
            {
                // Ajoute la direction (entre -1 et 1)
                snakes[si].disques[i].position.x = disk.position.x + snake['directionX'];
                snakes[si].disques[i].position.y = disk.position.y + snake['directionY'];
            }

            if(snakes[si].disques[i].position.x > 1000)
                snakes[si].disques[i].position.x = 0;

            if(snakes[si].disques[i].position.x < 0)
                snakes[si].disques[i].position.x = 1000;

            if(snakes[si].disques[i].position.y > 500)
                snakes[si].disques[i].position.y = 0;

            if(snakes[si].disques[i].position.y < 0)
                snakes[si].disques[i].position.y = 500;

            snakes[si].histo['corps'+i].push(disk.position);
        }
        snakes[si].count++;
    }   
}

function changeDirection(point,i)
{
    vector = (point - snakes[i].disques[0].position);
	
	// Normalisation (x et y divisés par la taille)
	vectorN = vector.normalize();
	
	// Ajout aux directions
	snakes[i].directionX = vectorN.x;
	snakes[i].directionY = vectorN.y;
    console.log(x);
    console.log(y);
}