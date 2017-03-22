(function() {
'use strict';

const R = require('ramda');

module.exports = class Board {
	// Board should be an array of objects, not a string, at this point.
	// Use function create_sqr_array_from_fen
	constructor( board, turn, castling, en_passant, halfmoves, fullmoves ) {
		// Need to map each of the board array values on to a method of Board class
		const self = this;
		const add_sqr = sqr => self["" + sqr.x + sqr.y] = sqr;
		R.map( add_sqr, board );
		this.turn = turn;
		this.castling = castling;
		this.en_passant = en_passant;
		this.halfmoves = halfmoves;
		this.fullmoves = fullmoves;
	}
}

})();