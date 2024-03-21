// global assumptions:
// there are two alive states, 'R' and 'B'

let Constants = {
  VICTORY_THRESHOLD: 0.8,
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
  let neighbors = neighborIndexFn(i, j, maxI, maxJ).map((i, j) => prev[i][j]);
  let numR = 0;
  let numB = 0;
  for (neighbor of neighbors) {
    if (neighbor === "R") {
      numR++;
    } else if (neighbor === "B") {
      numB++;
    }
  }

  let numAlive = numR + numB;
  if (numAlive < 2 || numAlive > 3) {
    return NULL;
  } else if (numAlive === 2) {
    return prev[i][j];
  } else {
    return numR > numB ? "R" : "B";
  }
}

// returns an array of all indices adjacent to the passed index 
// borders are considered solid and so bordering cells have fewer neighbors
function nowrapNeighborIndices(i, j, maxI, maxJ) {
  let result = new Array();
  for (x = Math.max(0, i - 1); x < Math.min(maxI, i + 2); x++) {
    for (y = Math.max(0, j - 1); y < Math.min(maxJ, j + 2); y++) {
      if (!(x == i && y == j)) {
        result.push((i, j));
      }
    }
  }
}

// returns an array of all indices adjacent to the passed index 
// borders wrap around i.e. the last row is adjacent to the first
// and same for colums
function wrapNeighborIndices(i, j, maxI, maxJ) {
  let result = new Array();
  for (x = (i - 1) % maxI; x <= (i + 1) % maxI; x++) {
    for (y = (j - 1) % maxJ; y <= (j + 1) % maxJ; y++) {
      if (!(x == i && y == j)) {
        result.push((i, j));
      }
    }
  }
}

// returns which player, if any, has won the game
// if no player has won, returns null
// TODO: maybe have an enum or something else
//
// Input - a 2d array of strings
function winner(board) {
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













