ws = new WebSocket('wss://localhost:3000');
ws.onopen = function()
{
	ws.send('connexion client');
    createSnake();
};
ws.onmessage = function(message)
{
	console.log('reponse : %s', message.data);
    if(message.data == 'update')
    {
        getFrame();
    }
};

var snakes = [];

function createSnake()
{
    for	(i = 0; i < 8; i++)
    {
        createCircle(nombreDisques);
    }
    
}

/*//Music
var player = document.querySelector('#audioPlayer');
player.play();
*/

// Création disque
var maxX = 1000;
var maxY = 500;
var directionX = 1;
var directionY = 0;
var pointDisque = new Point(200,100);

var count = 0;
var nombreDisques = 0;

var disques = [];
var histo = new Array();

var tailleCercle = 10;

// Affichage disque
function createCircle (nombre) {
	if(nombre==0)
	{
		var disque = new Path.Circle({
			center: [pointDisque.x, pointDisque.y],
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
	disques.push(disque);
	histo['corps'+nombreDisques] = new Array();
	nombreDisques++;
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function onMouseDown(event) {
	// Créé le vecteur entre le centre du disque et le point cliqué
	vector = (event.point - disques[0].position);
	
	// Normalisation (x et y divisés par la taille
	vectorN = vector.normalize();
	
	// Ajout aux directions
	directionX = vectorN.x;
	directionY = vectorN.y;
};

function getFrame() {
    while (count <= tailleCercle)
    {
        for	(i = disques.length-1; i > -1; i--)
        {
            disk = disques[i];
            disk.position.x = disk.position.x + directionX;
            disk.position.y = disk.position.y + directionY;
            histo['corps'+i].push(disk.position);
        }
        count++;
    }
    for	(i = disques.length-1; i > -1; i--)
    {
        disk = disques[i]
        if(i != 0)
        {
            disk.position.x = histo['corps'+(i-1)][count-tailleCercle].x;
            disk.position.y = histo['corps'+(i-1)][count-tailleCercle].y;
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

        histo['corps'+i].push(disk.position);
    }
    count++;
    paper.view.update();
};