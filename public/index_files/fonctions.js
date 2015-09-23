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
			center: [disques[nombre-1].position.x+50, disques[nombre-1].position.y],
			radius: 30,
			fillColor: 'blue',
			strokeColor: 'black'
		});
	}
	disques.push(disque);
	return nombre+1;
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
	for	(i = disques.length-1; i > -1; i--)
	{
		disk = disques[i]
		if(i != 0)
		{
			disk.position.x = disques[i-1].position.x+20;
			disk.position.y = disques[i-1].position.y+20;
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