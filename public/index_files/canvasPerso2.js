// Création disque
var maxX = 1000;
var maxY = 500;
var directionX = 1;
var directionY = 0;
var pointDisque = new Point(900,400);

var disques = [];

// Affichage disque
var disque = new Path.Circle({
	center: [pointDisque.x, pointDisque.y],
	radius: 30,
	fillColor: 'green'
});

disques.push(disque);

var disque2 = new Path.Circle({
	center: [pointDisque.x+50, pointDisque.y],
	radius: 30,
	fillColor: 'blue'
});

disques.push(disque2);

var disque3 = new Path.Circle({
	center: [pointDisque.x+100, pointDisque.y],
	radius: 30,
	fillColor: 'red'
});

disques.push(disque3);

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function onMouseDown(event) {
	// Créé le vecteur entre le centre du disque et le point cliqué
	vector = (event.point - disque.position);
	
	// Normalisation (x et y divisés par la taille
	vectorN = vector.normalize();
	
	// Ajout aux directions
	directionX = vectorN.x;
	directionY = vectorN.y;
};

function onFrame(event) {
	for	(i = 0; i < disques.length; i++) {
		disk = disques[i];
		console.log(disk);
		//Ajoute la direction (entre -1 et 1)
		disk.position.x = disk.position.x + directionX;
		disk.position.y = disk.position.y + directionY;
		
		//Dépassement des bornes
		if(disk.position.x > 1000)
			disk.position.x = 0;
		
		if(disk.position.x < 0)
			disk.position.x = 1000;
		
		if(disk.position.y > 500)
			disk.position.y = 0;
		
		if(disk.position.y < 0)
			disk.position.y = 500;
	}
	
	for	(i = disques.length-1; i > -1; i--)
	{
		disk = disques[i]
		if(i != 0)
		{
			disk.position.x = disques[i-1].position.x
			disk.position.y = disques[i-1].position.y
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
	}
}