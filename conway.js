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

}

// returns an array of all indices adjacent to the passed index 
// borders are considered solid and so bordering cells have fewer neighbors
function nowrapNeighborIndices(i, j, maxI, maxJ) {

}

// returns an array of all indices adjacent to the passed index 
// borders wrap around i.e. the last row is adjacent to the first
// and same for colums
function wrapNeighborIndices(i, j, maxI, maxJ) {

}
