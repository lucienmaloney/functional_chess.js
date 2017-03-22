(function() {
'use strict';

// Each square on the board will have its own object, and they will all be in either an array or in the board object
// This information is used to track the status of the game
module.exports = class Square {
	constructor( side, piece, x, y ) {
		this.side = side;
		this.piece = piece;
		this.x = x;
		this.y = y;
	}
}

})();