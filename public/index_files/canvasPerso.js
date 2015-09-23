// Création disque
var maxX = 1000;
var maxY = 500;
var directionX = 1;
var directionY = 0;
var pointDisque = new Point(100,100);

var count = 0;
var nombreDisques = 0;

var disques = [];
var histo = new Array();

for	(i = 0; i < 3; i++)
{
	createCircle(nombreDisques);
}

// Affichage disque
function createCircle (nombre) {
	if(nombre==0)
	{
		var disque = new Path.Circle({
			center: [pointDisque.x, pointDisque.y],
			radius: 30,
			fillColor: 'green',
			strokeColor: 'black'
		});
	}
	else
	{
		var disque = new Path.Circle({
			center: [disques[nombre-1].position.x-20, disques[nombre-1].position.y],
			radius: 30,
			fillColor: 'blue',
			strokeColor: 'black'
		});
	}
	disques.push(disque);
	histo['serpent'+nombreDisques] = new Array();
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

function onFrame(event) {
	while (count <= 20)
	{
		for	(i = disques.length-1; i > -1; i--)
		{
			disk = disques[i];
			disk.position.x = disk.position.x + directionX;
			disk.position.y = disk.position.y + directionY;
			histo['serpent'+i].push(disk.position);
		}
		count++;
	}
	for	(i = disques.length-1; i > -1; i--)
	{
		disk = disques[i]
		if(i != 0)
		{
			disk.position.x = histo['serpent'+(i-1)][count-20].x;
			disk.position.y = histo['serpent'+(i-1)][count-20].y;
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
		
		histo['serpent'+i].push(disk.position);
	}
	count++;
}