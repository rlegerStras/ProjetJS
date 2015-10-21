/*jslint node: true */
/*global sleep*/
'use strict';
var gameState = require('../gameState');

/* 1er snake de test */
var snake = JSON.parse('{"disques":[{"x":200,"y":385.0},{"x":190,"y":385.0,"color":"#008000"},{"x":180,"y":385.0,"color":"#008000"},{"x":170,"y":385.0,"color":"#008000"},{"x":160,"y":385.0,"color":"#008000"},{"x":150,"y":385.0,"color":"#008000"},{"x":140,"y":385.0,"color":"#008000"},{"x":130,"y":385.0,"color":"#008000"}],"histo":{"corps0":[{"x":191,"y":385.0},{"x":192,"y":385.0},{"x":193,"y":385.0},{"x":194,"y":385.0},{"x":195,"y":385.0},{"x":196,"y":385.0},{"x":197,"y":385.0},{"x":198,"y":385.0},{"x":199,"y":385.0},{"x":200,"y":385.0}],"corps1":[{"x":181,"y":385.0},{"x":182,"y":385.0},{"x":183,"y":385.0},{"x":184,"y":385.0},{"x":185,"y":385.0},{"x":186,"y":385.0},{"x":187,"y":385.0},{"x":188,"y":385.0},{"x":189,"y":385.0},{"x":190,"y":385.0}],"corps2":[{"x":171,"y":385.0},{"x":172,"y":385.0},{"x":173,"y":385.0},{"x":174,"y":385.0},{"x":175,"y":385.0},{"x":176,"y":385.0},{"x":177,"y":385.0},{"x":178,"y":385.0},{"x":179,"y":385.0},{"x":180,"y":385.0}],"corps3":[{"x":161,"y":385.0},{"x":162,"y":385.0},{"x":163,"y":385.0},{"x":164,"y":385.0},{"x":165,"y":385.0},{"x":166,"y":385.0},{"x":167,"y":385.0},{"x":168,"y":385.0},{"x":169,"y":385.0},{"x":170,"y":385.0}],"corps4":[{"x":151,"y":385.0},{"x":152,"y":385.0},{"x":153,"y":385.0},{"x":154,"y":385.0},{"x":155,"y":385.0},{"x":156,"y":385.0},{"x":157,"y":385.0},{"x":158,"y":385.0},{"x":159,"y":385.0},{"x":160,"y":385.0}],"corps5":[{"x":141,"y":385.0},{"x":142,"y":385.0},{"x":143,"y":385.0},{"x":144,"y":385.0},{"x":145,"y":385.0},{"x":146,"y":385.0},{"x":147,"y":385.0},{"x":148,"y":385.0},{"x":149,"y":385.0},{"x":150,"y":385.0}],"corps6":[{"x":131,"y":385.0},{"x":132,"y":385.0},{"x":133,"y":385.0},{"x":134,"y":385.0},{"x":135,"y":385.0},{"x":136,"y":385.0},{"x":137,"y":385.0},{"x":138,"y":385.0},{"x":139,"y":385.0},{"x":140,"y":385.0}],"corps7":[{"x":121,"y":385.0},{"x":122,"y":385.0},{"x":123,"y":385.0},{"x":124,"y":385.0},{"x":125,"y":385.0},{"x":126,"y":385.0},{"x":127,"y":385.0},{"x":128,"y":385.0},{"x":129,"y":385.0},{"x":130,"y":385.0}]},"directionX":1,"directionY":0,"vies":5,"score":0}');

/* 2e snake de test */
var snake2 = JSON.parse('{"disques":[{"x":200,"y":283.7518571072724,"color":"#87CEFA"},{"x":190,"y":283.7518571072724,"color":"#FFB6C1"},{"x":180,"y":283.7518571072724,"color":"#FFB6C1"},{"x":170,"y":283.7518571072724,"color":"#FFB6C1"},{"x":160,"y":283.7518571072724,"color":"#FFB6C1"},{"x":150,"y":283.7518571072724,"color":"#FFB6C1"},{"x":140,"y":283.7518571072724,"color":"#FFB6C1"},{"x":130,"y":283.7518571072724,"color":"#FFB6C1"}],"histo":{"corps0":[{"x":191,"y":283.7518571072724},{"x":192,"y":283.7518571072724},{"x":193,"y":283.7518571072724},{"x":194,"y":283.7518571072724},{"x":195,"y":283.7518571072724},{"x":196,"y":283.7518571072724},{"x":197,"y":283.7518571072724},{"x":198,"y":283.7518571072724},{"x":199,"y":283.7518571072724},{"x":200,"y":283.7518571072724}],"corps1":[{"x":181,"y":283.7518571072724},{"x":182,"y":283.7518571072724},{"x":183,"y":283.7518571072724},{"x":184,"y":283.7518571072724},{"x":185,"y":283.7518571072724},{"x":186,"y":283.7518571072724},{"x":187,"y":283.7518571072724},{"x":188,"y":283.7518571072724},{"x":189,"y":283.7518571072724},{"x":190,"y":283.7518571072724}],"corps2":[{"x":171,"y":283.7518571072724},{"x":172,"y":283.7518571072724},{"x":173,"y":283.7518571072724},{"x":174,"y":283.7518571072724},{"x":175,"y":283.7518571072724},{"x":176,"y":283.7518571072724},{"x":177,"y":283.7518571072724},{"x":178,"y":283.7518571072724},{"x":179,"y":283.7518571072724},{"x":180,"y":283.7518571072724}],"corps3":[{"x":161,"y":283.7518571072724},{"x":162,"y":283.7518571072724},{"x":163,"y":283.7518571072724},{"x":164,"y":283.7518571072724},{"x":165,"y":283.7518571072724},{"x":166,"y":283.7518571072724},{"x":167,"y":283.7518571072724},{"x":168,"y":283.7518571072724},{"x":169,"y":283.7518571072724},{"x":170,"y":283.7518571072724}],"corps4":[{"x":151,"y":283.7518571072724},{"x":152,"y":283.7518571072724},{"x":153,"y":283.7518571072724},{"x":154,"y":283.7518571072724},{"x":155,"y":283.7518571072724},{"x":156,"y":283.7518571072724},{"x":157,"y":283.7518571072724},{"x":158,"y":283.7518571072724},{"x":159,"y":283.7518571072724},{"x":160,"y":283.7518571072724}],"corps5":[{"x":141,"y":283.7518571072724},{"x":142,"y":283.7518571072724},{"x":143,"y":283.7518571072724},{"x":144,"y":283.7518571072724},{"x":145,"y":283.7518571072724},{"x":146,"y":283.7518571072724},{"x":147,"y":283.7518571072724},{"x":148,"y":283.7518571072724},{"x":149,"y":283.7518571072724},{"x":150,"y":283.7518571072724}],"corps6":[{"x":131,"y":283.7518571072724},{"x":132,"y":283.7518571072724},{"x":133,"y":283.7518571072724},{"x":134,"y":283.7518571072724},{"x":135,"y":283.7518571072724},{"x":136,"y":283.7518571072724},{"x":137,"y":283.7518571072724},{"x":138,"y":283.7518571072724},{"x":139,"y":283.7518571072724},{"x":140,"y":283.7518571072724}],"corps7":[{"x":121,"y":283.7518571072724},{"x":122,"y":283.7518571072724},{"x":123,"y":283.7518571072724},{"x":124,"y":283.7518571072724},{"x":125,"y":283.7518571072724},{"x":126,"y":283.7518571072724},{"x":127,"y":283.7518571072724},{"x":128,"y":283.7518571072724},{"x":129,"y":283.7518571072724},{"x":130,"y":283.7518571072724}]},"directionX":1,"directionY":0,"vies":1,"score":0}');

/* Ajout des snakes */
gameState.snakes.push(snake);
gameState.snakes.push(snake2);

/**
* Fonction de test de changeDirection
*/
function test_changeDirection(expectedX, expectedY) {
    var point = {
        x : 199,
        y : 385
    },
        i = 0,
        newX,
        newY;
    gameState.changeDirection(point, i);
    newX = gameState.snakes[0].directionX;
    newY = gameState.snakes[0].directionY;
    
    if (newX === expectedX && newY === expectedY) {
        console.log("true");
    } else {
        console.log("false");
        console.log("expected " + expectedX + ", found " + newX);
        console.log("expected " + expectedY + ", found " + newY);
    }
}

/**
* Fonction de test de touche
*/
function test_touche(expected) {
    //Simulation du snake 0 touché
    var newVal;
    gameState.touche(0, 1);
    newVal = gameState.snakes[0].vies;
    
    if (newVal === expected) {
        console.log("true");
    } else {
        console.log("false");
        console.log("expected " + expected + ", found " + newVal);
    }
}

/**
* Fonction de test de testDetection
*/
function test_testDetection(expected) {
    // On met la tête du 1 touchant le corps du 0
    var newVal;
    gameState.snakes[1].disques[0].x = gameState.snakes[1].disques[7].x - 4;
    gameState.snakes[1].disques[0].y = gameState.snakes[1].disques[7].y;
    gameState.testDetection();
    newVal = gameState.snakes[0].score;
    
    if (newVal === expected) {
        console.log("true");
    } else {
        console.log("false");
        console.log("expected " + expected + ", found " + newVal);
    }
}

/**
* Fonction de test de decalageHistorique
*/
function test_decalageHistorique(expectedX, expectedY) {
    // On vérifie si les valeurs ont été décalées par la gauche
    var newX,
        newY;

    gameState.decalageHistorique(0, 0);
    
    newX = gameState.snakes[0].histo.corps0[0].x;
    newY = gameState.snakes[0].histo.corps0[0].y;
    
    if (newX === expectedX && newY === expectedY) {
        console.log("true");
    } else {
        console.log("false");
        console.log("expected " + expectedX + ", found " + newX);
        console.log("expected " + expectedY + ", found " + newY);
    }
}

/**
* Fonction de test de calculNewPosition
*/
function test_calculNewPosition(expectedX, expectedY) {
    // Simulation de déplacement du snake
    var newX,
        newY;
    gameState.calculNewPosition();
    
    newX = gameState.snakes[0].disques[0].x;
    newY = gameState.snakes[0].disques[0].y;
    
    if (newX === expectedX && newY === expectedY) {
        console.log("true");
    } else {
        console.log("false");
        console.log("expected " + expectedX + ", found " + newX);
        console.log("expected " + expectedY + ", found " + newY);
    }
}

/**
* Main des tests
*/
function main() {
    test_decalageHistorique(gameState.snakes[0].histo.corps0[1].x, gameState.snakes[0].histo.corps0[1].y);
    test_changeDirection(-1, 0);
    test_calculNewPosition(199, 385);
    test_calculNewPosition(198, 385);
    test_touche(gameState.snakes[0].vies - 1);
    test_testDetection(gameState.snakes[0].score);
}

main();