//ws
ws = new WebSocket('wss://localhost:3000');
ws.onopen = function()
{
    snake = createSnakeServer();
    Jsnake = JSON.stringify(snake);  
    console.log(Jsnake);
    ws.send("creation"+Jsnake);
};
ws.onmessage = function(message)
{
    console.log(message.data);
    if(message.data.indexOf("creationSnake") != -1 )
    {
        messageJ = message.data.replace("creationSnake","");
        newSnake = JSON.parse(messageJ);
        createSnakePaper(newSnake);
    }
    
    if(message.data.indexOf("update") != -1 )
    {
        messageJ = message.data.replace("update","");
        snakes = JSON.parse(messageJ);
        console.log(snakes);
    }
};

//Initialisation taille Canvas et Cercle

var maxX = 1000;
var maxY = 500;
var initTete = new Point(200,100);
var tailleCercle = 10;
var nbDisqueIni = 8;
var snakes = [];

function createSnakeServer()
{
    var directionX = 1;
    var directionY = 0;
    
    var histo = {};
    var disques = [];
    
    for	(i = 0; i < nbDisqueIni; i++)
    {
        histo['corps'+i] = new Array();
        disk = createCircle(i,disques);
        disques.push(disk);
        d = { x: disk.x,
              y: disk.y
            }
        for (j = 0; j <= 20 ; j++)
        {
            histo['corps'+i].push(d);
        }
    }
    
    
    var snake =
    {
        disques : disques,
        histo : histo,
        directionX : directionX,
        directionY : directionY,
        count : 20
    }
    
    return snake;
}

function createSnakePaper(newSnake)
{
    snake = [];
    for(i=0;i<newSnake.disques.length;i++)
    {
        var disque = new Path.Circle({
            center: [newSnake.disques[i].x, newSnake.disques[i].y],
            radius: tailleCercle,
            fillColor: newSnake.disques[i].color,
            strokeColor: 'black'
        });
    }
    snake.push(disque);
}

function createCircle (nombre,disques) {
    
    if(nombre==0)
	{
        xVal = initTete.x;
        yVal = initTete.y;
        colorVal = 'green';
    }
    else
    {
        xVal = disques[nombre-1].x-tailleCercle;
        yVal = disques[nombre-1].y;
        colorVal = 'blue';
    }
    var disque =
        {
            x : xVal,
            y : yVal,
            color : colorVal
        };
    return disque;
}

function onMouseDown(event) {
    
    var point =
        {
            x : event.point.x,
            y : event.point.y+0.59375
        }
    
    Jpoint = JSON.stringify(point);
    ws.send('clic'+Jpoint);
};
/*
//Mise à jour des vues

*/

//paper.view.update();

/*//Music
var player = document.querySelector('#audioPlayer');
player.play();
*/