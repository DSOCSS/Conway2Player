const canvas = document.getElementById("game-of-life");
const ctx = canvas.getContext("2d");

const Colors = {
  red: "#d13e36",
  blue: "#3266a8",
  black: "#4f3754"
}

function getColor(value){
  switch(value){
    case null: return Colors.black; break;
    case "R": return Colors.red; break;
    case "B": return Colors.blue; break;
  }
}

function drawGame(board) {
  let nextBoard = nextGeneration(board, nowrapNeighborIndices); //get the next board
  console.log("nextBoard", nextBoard);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let paddingSize = Math.max(canvas.width / 200, canvas.height / 150);
  let cellsize = Math.min(canvas.width / board[0].length, canvas.height / board.length);

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      // pick appropriate color for cell
      ctx.fillStyle = getColor(board[row][col]);
      ctx.fillRect(col * cellsize, row * cellsize, cellsize - paddingSize, cellsize - paddingSize);

      // highlight alive cells that will die
      if(board[row][col] != null && nextBoard[row][col] == null){
        const innerBoxSize = cellsize / 4;
        ctx.fillStyle = Colors.black;
        ctx.fillRect(col * cellsize + innerBoxSize, row * cellsize + innerBoxSize, cellsize - paddingSize - innerBoxSize * 2, cellsize - paddingSize - innerBoxSize * 2);
      }
      // highlight dead cells that will become alive
      if(board[row][col] == null && nextBoard[row][col] != null){
        const innerBoxSize = cellsize / 2;
        console.log(row,col,"not null");
        ctx.fillStyle = getColor(nextBoard[row][col]);
        ctx.fillRect(col * cellsize + innerBoxSize, row * cellsize + innerBoxSize, cellsize - paddingSize - innerBoxSize * 2, cellsize - paddingSize - innerBoxSize * 2);
      }
    }
  }
  console.log(board.length, board[0].length);
}

// Choose a board size / ratio based on screen size
function initializeBoard() {
  if (window.innerWidth <= 500) {
    // vertical layout & less pixels for phones
    return newBoard(16, 8);
  } else {
    // horizontal layout & more pixels for tablets / laptops
    return newBoard(14, 28);
  }
}

let board = initializeBoard();
resizeCanvas(board);

window.addEventListener("resize", () => { resizeCanvas(board) });

function resizeCanvas(game) {
  let screenElem = document.getElementById("screenSize");
  canvas.width = screenElem.clientWidth - 20;
  canvas.height = screenElem.clientHeight - 20;
  drawGame(game);
}

// window.setInterval(() => {
//   board = nextGeneration(board, nowrapNeighborIndices);
//   drawGame(board);
//   console.log("iterated");
// }, 1000);

function advance(){
  board = nextGeneration(board, nowrapNeighborIndices);
  drawGame(board);
}