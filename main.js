const canvas = document.getElementById("game-of-life");
const ctx = canvas.getContext("2d");

const Colors = {
  red: "#d13e36",
  blue: "#3266a8",
  black: "#4f3754",
  highlight: "#1ff0a7"
}

const Verdicts = {
  WIN: 1,
  LOSE: 0
}

function getColor(value) {
  switch (value) {
    case null: return Colors.black; break;
    case "R": return Colors.red; break;
    case "B": return Colors.blue; break;
  }
}

function gameEnd(verdict){
  if(verdict == Verdicts.WIN){
    document.getElementById("winText").innerHTML = "You Win!";
    document.getElementById("winText").style.backgroundColor = Colors.blue;
  } else if (verdict == Verdicts.LOSE){
    document.getElementById("winText").innerHTML = "Game Over";
    document.getElementById("winText").style.backgroundColor = Colors.red;
  }
  document.getElementById("winText").style.display = "block"; // make the verdict visible
}

function getPaddingSize() {
  return Math.max(canvas.width / 200, canvas.height / 150);
}
function getCellSize() {
  return Math.min(canvas.width / board[0].length, canvas.height / board.length);
}

function drawGame(board, interpolation = 0.5) {
  drawChart(calculateBluePercentage(board)); // draw a pie chart

  let nextBoard = nextGeneration(board, nowrapNeighborIndices); //get the next board
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let paddingSize = getPaddingSize();
  let cellsize = getCellSize();

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      // pick appropriate color for cell
      ctx.fillStyle = getColor(board[row][col]);
      ctx.fillRect(col * cellsize, row * cellsize, cellsize - paddingSize, cellsize - paddingSize);

      // highlight alive cells that will die
      if (board[row][col] != null && nextBoard[row][col] == null) {
        const innerBoxSize = (cellsize * interpolation * 2) / 4;
        ctx.fillStyle = Colors.black;
        ctx.fillRect(col * cellsize + innerBoxSize, row * cellsize + innerBoxSize, cellsize - paddingSize - innerBoxSize * 2, cellsize - paddingSize - innerBoxSize * 2);
      }
      // highlight dead cells that will become alive
      if (board[row][col] == null && nextBoard[row][col] != null) {
        const innerBoxSize = (cellsize * interpolation) / 2;
        ctx.fillStyle = getColor(nextBoard[row][col]);
        ctx.fillRect(col * cellsize + innerBoxSize, row * cellsize + innerBoxSize, cellsize - paddingSize - innerBoxSize * 2, cellsize - paddingSize - innerBoxSize * 2);
      }
    }
  }
}

function calculateBluePercentage(board) {
  let blue = 0;
  let red = 0;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] == "B") blue++;
      else if (board[row][col] == "R") red++;
    }
  }
  return blue / (blue + red);
}

// highlight a square where a move occured (easier to keep track of game)
function highlightSquares(squares) {
  squares.forEach((square) => {
    ctx.strokeStyle = Colors.highlight;
    ctx.lineWidth = getPaddingSize();
    ctx.beginPath();
    ctx.rect(square[1] * getCellSize() - getPaddingSize() / 2, square[0] * getCellSize() - getPaddingSize() / 2, getCellSize(), getCellSize());
    ctx.stroke();
    console.log(square[1] * getCellSize(), square[0] * getCellSize(), getCellSize(), getCellSize());
  });
}

// Choose a board size / ratio based on screen size
function initializeBoard() {
  if (window.innerWidth <= 500) {
    // vertical layout & less pixels for phones
    return newBoard(14, 7);
  } else {
    // horizontal layout & more pixels for tablets / laptops
    return newBoard(10, 20);
  }
}

function resizeCanvas(game) {
  let screenElem = document.getElementById("screenSize");
  let topBarElem = document.getElementById("topBar");
  canvas.width = screenElem.clientWidth - 20;
  canvas.height = screenElem.clientHeight - topBarElem.clientHeight - 20;

  let aspectRatio = game[0].length / game.length; // width / height
  console.log(aspectRatio);

  // remove excess width
  canvas.width = Math.min(canvas.width, canvas.height * aspectRatio);
  // remove excess height
  canvas.height = Math.min(canvas.height, canvas.width / aspectRatio);
  drawGame(game);
}

function advance(moves) {
  //let nextBoard = nextGeneration(board, nowrapNeighborIndices);
  let c = 0.5;
  const drawInterval = setInterval(() => {
    drawGame(board, c);
    highlightSquares(moves);
    c -= 0.1;
    if (c <= 0) {
      clearInterval(drawInterval); // stop the interval
      // update the board
      board = nextGeneration(board, nowrapNeighborIndices);
      drawGame(board, 0.5);
      if (!checkForWin(board)){
        // the game is not over yet
        playersTurn = true; // animation is over, player can play next turn
      }
    }
  }, 50);
}

// return true if the game was won
function checkForWin(board){
  let bluePercent = calculateBluePercentage(board);
  console.log("bluePercent:",bluePercent);
  if (bluePercent >= 0.8){
    gameEnd(Verdicts.WIN);
    return true;
  } else if (bluePercent <= 0.2) {
    gameEnd(Verdicts.LOSE);
    return true;
  }
  return false;
}

// register player move
canvas.addEventListener("click", (evt) => {
  let x = Math.floor(evt.offsetX / getCellSize());
  let y = Math.floor(evt.offsetY / getCellSize());
  if (board[y][x] == null && playersTurn == true) {
    // valid move
    playersTurn = false; // temporarily disable player from making another turn
    board[y][x] = 'B'; // player move
    
    let comMove = computerMove(board, nowrapNeighborIndices, comStrategy, "R");
    board[comMove[0]][comMove[1]] = 'R'; // computer move
    
    drawGame(board); // draw & update game
    advance([comMove, [y,x]]);
  }
});

function drawChart(bluePercent) {
  const chartCanvas = document.getElementById("pieChart");
  const ctx2 = chartCanvas.getContext("2d");
  ctx2.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  ctx2.fillStyle = getColor("R");
  ctx2.beginPath();
  //make red be the circle's background
  ctx2.arc(chartCanvas.width / 2, chartCanvas.height / 2, chartCanvas.width / 2, 0, Math.PI * 2);
  ctx2.fill();

  ctx2.fillStyle = getColor("B");
  ctx2.beginPath();
  //fill in the blue over the red
  ctx2.moveTo(chartCanvas.width / 2, chartCanvas.height / 2); // start at center
  ctx2.lineTo(chartCanvas.width, chartCanvas.height / 2); // move to degree 0
  ctx2.arc(chartCanvas.width / 2, chartCanvas.height / 2, chartCanvas.width / 2, 0, bluePercent * Math.PI * 2);
  ctx2.moveTo(chartCanvas.width / 2, chartCanvas.height / 2); // return to center
  ctx2.fill();
}

let comStrategy = Strategies.RANDOM;

function hideWelcomeScreen(strategy){
  document.getElementById("welcome").style.display = "none";
  if(strategy == "SINGLE_MAX_FLIPPED"){
    comStrategy = Strategies.SINGLE_MAX_FLIPPED;
    console.log("Single Max Flipped");
  } else {
    comStrategy = Strategies.RANDOM;
    console.log("Random");
  }
}

let board = initializeBoard();
let playersTurn = true;
resizeCanvas(board);

window.addEventListener("resize", () => { resizeCanvas(board) });