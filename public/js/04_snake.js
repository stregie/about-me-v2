document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('start-button').addEventListener('click', snakeGame);
  document.getElementById('btn-dec-speed').addEventListener('click', function(){ changeSpeed(-1) });
  document.getElementById('btn-inc-speed').addEventListener('click', function(){ changeSpeed(+1) });
  document.getElementById('btn-highscore').addEventListener('click', showHighScore);
  document.getElementById('btn-back').addEventListener('click', backToGame);
});

var firstGame = true;
var cycle = 6; // length of one cycle - can be used adjust speed of game. Min 2
var score = 0;
var speed = 3; // This is just a displayed value
var lowestSpeed = 5;
document.getElementById('score').textContent = score;
document.getElementById('speed-display').textContent = speed;

function changeSpeed(n){
  if (n === -1 && 1 < speed || n === +1 && speed < 5){
    speed += n;
    cycle -= 2 * n;
    document.getElementById('speed-display').textContent = speed;
  }
  if (speed < lowestSpeed){
    lowestSpeed = speed;
  }
};

function snakeGame() {
  if (!firstGame){
    return
  } else {
    firstGame = false;
  }
  lowestSpeed = speed;

  const canvasHtml = document.getElementById("snake-canvas");
  const ctx = canvasHtml.getContext("2d");
  
  // The new Object() method is used instead an object literal to avoid accessing properties before declaration
  const canvas = new Object();
  canvas.squareSize = 20; // side of a square
  canvas.rightedge = canvasHtml.getAttributeNode("width").value / canvas.squareSize;
  canvas.bottom = canvasHtml.getAttributeNode("height").value / canvas.squareSize;
  canvas.clear = () => { 
    ctx.clearRect(0, 0, canvas.rightedge * canvas.squareSize, canvas.bottom * canvas.squareSize);
  };
  canvas.drawSquare = ([ x, y ], color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * canvas.squareSize, y * canvas.squareSize, canvas.squareSize, canvas.squareSize);
  };

  const isHit = ([ x, y ], [ x2, y2 ]) => x === x2 && y === y2;

  const snake = new Object();
  snake.direction = [1, 0];
  snake.body = [[5, 5], [4, 5], [3, 5], [2, 5]];
  snake.color = getComputedStyle(document.documentElement).getPropertyValue('--color-item-3');
  snake.draw = () => {
    snake.body.forEach((coord) => canvas.drawSquare(coord, snake.color));
  };
  snake.growth = 3;
  snake.getNextStep = () => {
    return [snake.body[0][0] + snake.direction[0], snake.body[0][1] + snake.direction[1]];
  };
  snake.check180turn = () => {
    if(isHit(snake.nextStep, snake.body[1])){
      snake.direction[0] = snake.direction[0] * -1;
      snake.direction[1] = snake.direction[1] * -1;
      snake.nextStep = snake.getNextStep();
    }
  };
  snake.checkApple = () => {        
    if(isHit(snake.nextStep, apple.position)){
      snake.growth = snake.growth + 3;
      apple.newApple();
      score++;
      document.getElementById('score').textContent = score;
    }
  };
  snake.checkHitSelf = () => {
    if(snake.body.some((position) => isHit(position, snake.nextStep))){
      gameOver("Hit self");
    }
  };
  snake.checkHitWall = () => {
    if(snake.nextStep[0] === -1 || snake.nextStep[0] === canvas.rightedge || snake.nextStep[1] === -1 || snake.nextStep[1] === canvas.bottom) gameOver('Wall hit');
  };
  snake.updatePosition = () => {
    snake.body.unshift(snake.nextStep);
    if(snake.growth > 0){
      snake.growth--;
    } else {
      snake.body.pop();
    }
  };

  const apple = new Object();
  apple.position = [7, 8];
  apple.color = "#AD343E";
  apple.draw = () => {
    canvas.drawSquare(apple.position, apple.color);
  };
  apple.newApple = () => {
    let regen = true;
    while (regen) {
      regen = false; 
      apple.position = [ Math.floor(Math.random() * canvas.rightedge), Math.floor(Math.random() * canvas.bottom) ]
      if(snake.body.some((position) => isHit(position, apple.position))){ // check if apple is spawned on snake body
        regen = true;
      } 
    }
  };

  const handleKeyPress = (k) => {
    snake.currentDirection = [...snake.direction]; // Stores the last direction before the keystrok

    switch (k.code){
      case 'KeyW':
        k.preventDefault(); // to prevent browser scrolling
        snake.direction = [0, -1];
        break;
      case 'KeyS':
        k.preventDefault();
        snake.direction = [0, 1];
        break;
      case 'KeyA':
        k.preventDefault();
        snake.direction = [-1, 0];
        break;
      case 'KeyD':
        k.preventDefault();
        snake.direction = [1, 0];
        break;
      case 'KeyG':
        snake.growth = 3;
        break;
      case 'KeyF':
        apple.newApple();
        break;
      case 'Escape':
        gameOver("Manual abort");
        break;
    }

    // If snake turns, turn immediately, to assist zig-zag movements
    // If a pressed key does not change direction, it won't step forward immediately to prevent jumping forward.
    if (snake.currentDirection[0] !== snake.direction[0] && snake.currentDirection[1] !== snake.direction[1]){
      tick = cycle;
    } 
  };
  document.addEventListener('keydown', handleKeyPress, false);


  let tick = 0;

  const gameLoop = () => {
    if (tick < cycle){
      tick++;
    } else {  // new cycle starts if direction is changed or if max ticks are reached
      snake.nextStep = snake.getNextStep();
      snake.check180turn();
      snake.checkHitSelf();
      snake.checkHitWall();
      snake.checkApple();
      snake.updatePosition();
      canvas.clear();
      snake.draw();
      apple.draw();
      tick = 0; // New cycle
    }
  };

  const game = setInterval(gameLoop, 5);

  const gameOver = (reason) => {
    snake.growth++; // Even though the "game" interval is cleared, the last cycle runs and 
    console.log(reason);
    submitScore();
    clearInterval(game);     
    document.removeEventListener('keydown', handleKeyPress);
  };        
};

function showHighScore(){
  document.getElementById('btn-highscore').classList.add('d-none');
  document.getElementById('btn-back').classList.remove('d-none');
  document.getElementById('snake-game').classList.add('d-none');
  document.getElementById('highscore').classList.remove('d-none');
  document.getElementById('start-btn-container').classList.add('d-none');
  document.getElementById('speed-controls').classList.add('d-none');

  fetch('/snake/highscore')
  .then(res => res.json())
  .then(data => {    
    displayData(data);
    console.log(data);
  })
};

function displayData(data){
  $('#highscore tbody').html('');
  for (let i = 0; i < data.length; i++){
    let html = "<tr><td>" + data[i].player + "</td><td>" + data[i].score + "</td><td>" + data[i].speed;
    $('#highscore').find('tbody').append(html);
  }
};

function backToGame(){
  document.getElementById('btn-highscore').classList.remove('d-none');
  document.getElementById('btn-back').classList.add('d-none');
  document.getElementById('snake-game').classList.remove('d-none');
  document.getElementById('highscore').classList.add('d-none');
  document.getElementById('start-btn-container').classList.remove('d-none');
  document.getElementById('speed-controls').classList.remove('d-none');
};

function submitScore(){
  let player = prompt("Game Over! Your final score is: " + score + ". Please enter your name.", "Name");
  if (player == null || player == "") {
    console.log("nosubmit");
  } else {
    console.log("submit: " + player + " score " + score);
    let data = {
      player: player,
      score: score,
      speed: lowestSpeed
    };

    fetch('/snake/score/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(res => res.text())
    .then(response => {
      console.log(response);
      showHighScore();
    })
    .catch((error) => {
      console.log(error);
    });
  }
};