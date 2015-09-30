//ws
ws = new WebSocket('wss://localhost:3000');
ws.onopen = function()
{
    console.log("ok");
    snake = createSnake();
    Jsnake = JSON.stringify(snake);
    ws.send("creation"+Jsnake);
};
ws.onmessage = function(message)
{
	console.log('reponse : %s', message.data);
    /*if(message.data == 'update')
    {
        getFrame();
    }*/
};

//Initialisation taille Canvas et Cercle

var maxX = 1000;
var maxY = 500;
var initTete = new Point(200,100);
var tailleCercle = 10;
var nbDisqueIni = 8;

function createSnake()
{
    var directionX = 1;
    var directionY = 0;
    var count = 0;
    
    var histo = new Array();
    var disques = [];
    
    for	(i = 0; i < nbDisqueIni; i++)
    {
        histo['corps'+i] = new Array();
        disk = createCircle(i,disques);
        disques.push(disk);
        for (j = 0; j <= 20 ; j++)
        {
            histo['corps'+i].push(disk.position);
        }
    }
    
    var snake =
    {
        disques : disques,
        histo : histo,
        directionX : directionX,
        directionY : directionY,
        count : count
    }
    
    return snake;
}

// Création disque
function createCircle (nombre,disques) {
	if(nombre==0)
	{
		var disque = new Path.Circle({
			center: [initTete.x, initTete.y],
			radius: tailleCercle,
			fillColor: 'green',
			strokeColor: 'black'
		});
	}
	else
	{
		var disque = new Path.Circle({
			center: [disques[nombre-1].position.x-tailleCercle, disques[nombre-1].position.y],
			radius: tailleCercle,
			fillColor: 'blue',
			strokeColor: 'black'
		});
	}
    return disque;
}

function onMouseDown(event) {
	// Créé le vecteur entre le centre du disque et le point cliqué
	/*vector = (event.point - disques[0].position);
	
	// Normalisation (x et y divisés par la taille
	vectorN = vector.normalize();
	
	// Ajout aux directions
	directionX = vectorN.x;
	directionY = vectorN.y;
    
    ws.send('clic');*/
    
    point = event.point;
    Jpoint = JSON.stringify(point);
    ws.send('clic'+point);
};
/*
//Mise à jour des vues
function getFrame(snakes) {
    for (si = 1 ; si < snakes.length ; si++)
    {
        snake = 
    }
    snake2 = snake;
    while (snake['count'] <= tailleCercle)
    {
        for	(i = snake['disques'].length-1; i > -1; i--)
        {
            disk = snake['disques'][i];
            disk.position.x = disk.position.x + snake['directionX'];
            disk.position.y = disk.position.y + snake['directionY'];
            snake2['histo']['corps'+i].push(disk.position);
        }
        count++;
    }
    for	(i = snake['disques'].length-1; i > -1; i--)
    {
        disk = snake['disques'][i]
        if(i != 0)
        {
            disk.position.x = snake2['histo']['corps'+(i-1)][snake2['count']-tailleCercle].x;
            disk.position.y = snake2['histo']['corps'+(i-1)][snake2['count']-tailleCercle].y;
        }
        else
        {
            // Ajoute la direction (entre -1 et 1)
            disk.position.x = disk.position.x + directionX;
            disk.position.y = disk.position.y + directionY;
        }

        if(disk.position.x > 1000)
            disk.position.x = 0;

        if(disk.position.x < 0)
            disk.position.x = 1000;

        if(disk.position.y > 500)
            disk.position.y = 0;

        if(disk.position.y < 0)
            disk.position.y = 500;

        snake2['histo']['corps'+i].push(disk.position);
    }
    snake2['count']++;
    paper.view.update();
};
*/

/*//Music
var player = document.querySelector('#audioPlayer');
player.play();
*/