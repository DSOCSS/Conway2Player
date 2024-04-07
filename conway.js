// global assumptions:
// there are two alive states, 'R' and 'B'

const Constants = {
  PERCENTAGE_INITIAL_ALIVE_CELLS_EACH: 0.25,
  VICTORY_THRESHOLD: 0.8,
};

const Strategies = {
  RANDOM: "Strategies.random",
  SINGLE_MAX_FLIPPED: "Strategies.single_max_flipped",
};

// **************** functions **************************** /

// computes and returns the next next generation 
// the previous generation is unchanged
// each generation is a 2d array of strings, which can be 
// empty, 'R' or 'B' 
//
// strategy is a FUNCTION for finding neighboring indices
//
// Implementation notes - any value other than 'R' or 'B' will
// be considered dead
function nextGeneration(prev, neighborIndexFn) {
  let maxI = prev.length;
  let maxJ = prev[0].length;
  // make 2D array
  let result = Array.from({ length: maxI },
    () => Array(maxJ).fill(null)
  );

  for (i = 0; i < maxI; i++) {
    for (j = 0; j < maxJ; j++) {
      result[i][j] = nextState(i, j, maxI, maxJ, prev, neighborIndexFn);
    }
  }

  return result;
}

// returns the next state of the element at index [i][j]
// calculated using the previous generation and a given
// next state function
function nextState(i, j, maxI, maxJ, prev, neighborIndexFn) {
  let neighbors = neighborIndexFn(i, j, maxI, maxJ).map(tup => prev[tup[0]][tup[1]]);
  //console.log(neighborIndexFn(i, j, maxI, maxJ));
  let numR = 0;
  let numB = 0;
  for (let neighbor of neighbors) {
    if (neighbor === "R") {
      numR++;
    } else if (neighbor === "B") {
      numB++;
    }
  }

  let numAlive = numR + numB;
  if (numAlive < 2 || numAlive > 3) {
    return null; // dies from over- or underpopulation
  } else if (numAlive === 2) {
    return prev[i][j]; // no change
  } else if (numAlive === 3 && prev[i][j] == null) {
    //new cell created with 3 parents
    if (numB > numR) return "B";
    return "R";
  } else {
    // has 3 neighbors and is alive
    return prev[i][j];
  }
}

// returns an array of all indices adjacent to the passed index 
// borders are considered solid and so bordering cells have fewer neighbors
function nowrapNeighborIndices(i, j, maxI, maxJ) {
  // console.log("i: " + i + "j: " + j + "(maxI, maxJ): " + maxI + " " + maxJ);
  let result = new Array();
  for (x = Math.max(0, i - 1); x < Math.min(maxI, i + 2); x++) {
    for (y = Math.max(0, j - 1); y < Math.min(maxJ, j + 2); y++) {
      if (!(x == i && y == j)) {
        result.push([x, y]);
      }
    }
  }
  return result;
}

// returns an array of all indices adjacent to the passed index 
// borders wrap around i.e. the last row is adjacent to the first
// and same for colums
function wrapNeighborIndices(i, j, maxI, maxJ) {
  let result = new Array();
  for (x = (i - 1) % maxI; x <= (i + 1) % maxI; x++) {
    for (y = (j - 1) % maxJ; y <= (j + 1) % maxJ; y++) {
      if (!(x == i && y == j)) {
        result.push([x, y]);
      }
    }
  }
  return result;
}

// counts each color and non-color
// returns array [numRed, numBlue, numOther]
function countColors(board) {
  let reds = 0;
  let blues = 0;
  let other = 0;
  for (i of board.flat()) {
    if (i === "R") {
      reds++;
    } else if (i === "B") {
      blues++;
    } else {
      other++;
    }
  }
  return [reds, blues, other];
}

function countSpecificColor(board, color) {
  // slightly inefficient but doesn't matter here
  let [reds, blues, _] = countColors(board);
  if (color === "R") {
    return reds;
  } else if (color === "B") {
    return blues;
  }

  return null;
}


// returns which player, if any, has won the game
// if no player has won, returns null
// TODO: maybe have an enum or something else
//
// Input - a 2d array of strings
function winner(board) {

  let [reds, blues, other] = countColors(board);

  let total = reds + blues + other;
  let threshold = Constants.VICTORY_THRESHOLD * total;
  if (reds > threshold) {
    return "R";
  }

  if (blues > threshold) {
    return "B"
  }

  return null;
}

// Input: current board
// returns an array containing indices of possible moves, i.e. empty indices
function possibleMoves(board) {
  let result = Array();
  for ([i, row] of board.entries()) {
    for ([j, cell] of row.entries()) {
      if (cell != "R" && cell != "B") {
        result.push([i, j]);
      }
    }
  }

  return result;
}

// creates a starting gameboard, with values populated with 
// "R", "B", and null
//
// the game board is mirrored across a vertical axis in the middle
function newBoard(numrows, numcols) {

  // Logic for maxXOfFirstHalf:
  //
  // if numrows = 8 
  // rows are 0 to 7
  // first half is 0,1,2,3 so maxXOfFirstHalf is 3
  // floor(8/2 - 1) = 3
  //
  //
  // if numrows = 9
  // rows are 0 to 8 
  // first half is 0,1,2,3 so maxXOfFirstHalf is 3
  // floor(9/2 - 1) = 3
  let maxXOfFirstHalf = Math.floor((numrows / 2) - 1);

  // Similar logic for mirroring
  // if numrows = 8 
  // mirror of 3 is 4 = 7 - 3
  //
  // if numrows == 9
  // mirror of 3 is 5 = 8 - 3
  let mirror = (x) => numrows - 1 - x;

  // randomly select a color to populate the left side
  let color = Math.random() > 0.5 ? "R" : "B";
  let otherColor = color == "R" ? "B" : "R";

  // initialize the array
  let result = Array.from({ length: numrows },
    () => Array(numcols).fill(null)
  );

  // populate the array
  let cellsToFill = Math.floor(numrows * numcols * Constants.PERCENTAGE_INITIAL_ALIVE_CELLS_EACH);
  while (cellsToFill > 0) {
    let i = getRandomIndex(maxXOfFirstHalf + 1);
    let j = getRandomIndex(numcols);

    if (result[i][j] == null) {
      result[i][j] = color;
      result[mirror(i)][j] = otherColor;
      cellsToFill--;
    }
  }

  return result;
}

// returns a random integer index between 0 and the max bound
// the max bound is exclusive
function getRandomIndex(maxIndex) {
  return Math.floor(Math.random() * maxIndex);
}

// choose an index for the "AI" player to play
// returns the 2D coordinates of the chosen move
//
// needs neighborIndexFn to actually figure out how the game is being played
function computerMove(board, neighborIndexFn, strategy, computerColor) {
  let validIndices = possibleMoves(board);
  switch (strategy) {
    case Strategies.RANDOM:
      return randomMove(validIndices);
    case Strategies.SINGLE_MAX_FLIPPED:
      return singleMaxFlippedMove(board, neighborIndexFn, validIndices, computerColor);
  }
}

// returns a random index from the array of valid indices
function randomMove(validIndices) {
  return validIndices[getRandomIndex(validIndices.length)];
}

// for each valid move, checks which move will result in the greatest
// number of cells flipped to the computer's side in the next move
function singleMaxFlippedMove(board, neighborIndexFn, validIndices, computerColor) {
  let bestMovesArray = new Array();
  let maxFlipped = 0;
  for (index of validIndices) {
    let x = index[0];
    let y = index[1];

    let withoutMove = nextGeneration(board, neighborIndexFn);
    let scoreOld = countSpecificColor(withoutMove, computerColor);

    let savedElementOfUnmodifedBoard = board[x][y];
    let temporarilyModifiedBoard = board;
    temporarilyModifiedBoard[x][y] = computerColor;

    let withMove = nextGeneration(temporarilyModifiedBoard, neighborIndexFn);
    let scoreNew = countSpecificColor(temporarilyModifiedBoard, computerColor);

    // reset board to old state 
    board[x][y] = savedElementOfUnmodifedBoard;

    // now do the flipping calculation 
    let flipped = scoreNew - scoreOld;
    if (flipped > maxFlipped) {
      maxFlipped = flipped;
      bestMovesArray = new Array();
      bestMovesArray.push([x, y]);
    } else if (flipped === maxFlipped) {
      bestMovesArray.push([x, y]);
    }
  }

  return bestMovesArray[getRandomIndex(bestMovesArray.length)];
}













