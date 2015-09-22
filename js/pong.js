var game = new Phaser.Game(480, 640, Phaser.AUTO, null, {
  preload: preload, create: create, update: update
});

var playerPaddle;
var computerPaddle;
var ball;

var computerPaddleSpeed = 200;
var ballSpeedBase = 250;
var ballReleased = false;
var paddleHeight = 20;
var playerPaddleHalfWidth = 0;

var startButton;

var textStyle = { font: '36px Arial', fill: '#CDD2D4' };
var computerText;
var computerScore = 0;
var playerText;
var playerScore = 0;

var gameStarted = false;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.load.image('background', 'assets/background.jpg');
  game.load.image('paddle', 'assets/paddle.png');
  game.load.image('ball', 'assets/ball.png');
  game.load.spritesheet('button', 'assets/button.png', 120, 40);
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.tileSprite(0, 0, game.width, game.height, 'background');
  startButton = game.add.button(game.world.centerX, game.world.centerY+(game.world.height * 0.25), 'button', startGame, this, 1, 0, 2);
  startButton.anchor.set(0.5);

  addDivisorLine();

  playerPaddle = createPaddle(game.world.centerX, game.world.height - paddleHeight);
  computerPaddle = createPaddle(game.world.centerX, paddleHeight);

  playerPaddleHalfWidth = playerPaddle.width / 2;

  ball = createBall();
  game.input.onDown.add(startGame, this);

  computerText = game.add.text(10, game.world.centerY - 56, 'Computer 0', textStyle);
  playerText = game.add.text(10, game.world.centerY + 16, 'Player 0', textStyle);

  game.physics.arcade.checkCollision.up = false;
  game.physics.arcade.checkCollision.down = false;
}

function update () {
  playerPaddle.x = game.input.x;

  playerUpdate(playerPaddle);
  computerUpdate(computerPaddle);

  game.physics.arcade.collide(ball, playerPaddle, ballHitsPaddle);
  game.physics.arcade.collide(ball, computerPaddle, ballHitsPaddle);
}

function createPaddle(x, y) {
  var paddle = game.add.sprite(x, y, 'paddle');
  game.physics.enable(paddle, Phaser.Physics.ARCADE);

  paddle.anchor.setTo(0.5);
  paddle.body.collideWorldBounds = true;
  paddle.body.bounce.setTo(1);
  paddle.body.immovable = true;

  return paddle;
}

function createBall() {
  ball = game.add.sprite(game.world.centerX, game.world.centerY, 'ball');
  game.physics.enable(ball, Phaser.Physics.ARCADE);

  ball.anchor.setTo(0.5);
  ball.body.collideWorldBounds = true;
  ball.body.bounce.setTo(1);

  ball.checkWorldBounds = true;
  ball.events.onOutOfBounds.add(ballLeaveScreen, this);

  return ball;
}

function releaseBall() {
  if (!ballReleased || !gameStarted) {
    var speedX = game.rnd.integerInRange(-game.world.width, game.world.width);
    var speedY = (parseInt(Math.random() * 50) + ballSpeedBase) * Phaser.Utils.randomChoice(-1, 1);
    ball.body.velocity.set(speedX, speedY);
    ballReleased = true;
  }
}

function ballHitsPaddle (_ball, _paddle) {
  var diff = 0;

  if (_ball.x < _paddle.x) {
    diff = _paddle.x - _ball.x;
    _ball.body.velocity.x = (-10 * diff);
  } else if (_ball.x > _paddle.x) {
    diff = _ball.x -_paddle.x;
    _ball.body.velocity.x = (10 * diff);
  } else {
    _ball.body.velocity.x = 2 + Math.random() * 8;
  }
}

function ballLeaveScreen(_ball) {
  if (_ball.y > game.world.height) {
    computerText.setText('Computer ' + ++computerScore);
  } else if (_ball.y < game.world.height) {
    playerText.setText('Player ' + ++playerScore);
  }

  _ball.reset(game.world.centerX, game.world.centerY);
  computerPaddle.reset(game.world.centerX, paddleHeight);
  ballReleased = false;
}

function addDivisorLine() {
  game.divisorLine = game.add.graphics(0, 0);
  game.divisorLine.lineStyle(16, '0xCDD2D4', 0.75);
  game.divisorLine.moveTo(0, game.world.centerY);
  game.divisorLine.lineTo(game.world.width, game.world.centerY);
}

function startGame() {
  startButton.destroy();
  gameStarted = true;
  releaseBall();
}

function playerUpdate(playerPaddle) {
  if (!playerPaddle.x) {
    playerPaddle.x = game.world.centerX;
  } else if (playerPaddle.x < playerPaddleHalfWidth) {
    playerPaddle.x = playerPaddleHalfWidth;
  } else if (playerPaddle.x > game.width - playerPaddleHalfWidth) {
    playerPaddle.x = game.width - playerPaddleHalfWidth;
  }
}

function computerUpdate(computerPaddle) {
  if(computerPaddle.x - ball.x < -paddleHeight) {
    computerPaddle.body.velocity.x = computerPaddleSpeed;
  } else if(computerPaddle.x - ball.x > paddleHeight) {
    computerPaddle.body.velocity.x = -computerPaddleSpeed;
  } else {
    computerPaddle.body.velocity.x = 0;
  }
}
