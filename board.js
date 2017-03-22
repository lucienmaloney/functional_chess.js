(function() {
'use strict';

const R = require('ramda');

module.exports = class Board {
	// array_of_square_objects is what the variable name suggests
	// easiest way to create one is using the create_sqr_array_from_fen function in fen.js
	constructor( array_of_square_objects, turn, castling, en_passant, halfmoves, fullmoves ) {
		// These three lines map over each square in array_of_square_objects, creating a new method of Board
		// For example the object Square { side: 'w', piece: 'p', x: 1, y: 2 } 
		//									would have name "12" and could be referred to with this["12"]
		const self = this;
		const add_sqr = sqr => self["" + sqr.x + sqr.y] = sqr;
		R.map( add_sqr, array_of_square_objects );

		// These 5 lines just set the incoming variables as methods of the class
		this.turn = turn;
		this.castling = castling;
		this.en_passant = en_passant;
		this.halfmoves = halfmoves;
		this.fullmoves = fullmoves;
	}
}

})();