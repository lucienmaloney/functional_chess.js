(function() {
'use strict';

const R = require('ramda');

module.exports = {
	// This function used in replacing the numbers in the fen string
	replace_number_with_that_many_spaces: function( str ) {
		// Function searches within a string for a number. If it finds one, it replaces it with
		// that many spaces. If it doesn't find one, it returns the string.
		const val = str.match(/\d/);
		if(!val) {
			return str;
		}
		const new_str = R.replace( val, " ".repeat(val), str );
		return module.exports.replace_number_with_that_many_spaces( new_str );
	},

	// This function takes an input like "d5" and replaces it with 45; letters to numbers
	// Because chess board is only 8 squares wide, this function only works for first 8 letters

	// TODO: Fix this function- it is broken. alpharray[letters] is undefined
	parse_chess_square: function( sqr ) {
		const alpharray = { "a": 1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8 };
		const letters = sqr.match(/[a-hA-H]/);
		if(!letters) {
			return parseInt(sqr);
		}
		return module.exports.parse_chess_square( R.replace( letters, alpharray[letters], sqr ));
	},

	int_to_letter_sqr: function( int_sqr ) {
		const int_str = int_sqr.toString()
		const alpharray = ["","a","b","c","d","e","f","g","h"];
		return alpharray[ parseInt( int_str[0] ) ] + parseInt( int_str[1] );
	},

	// Squares should fall into sequence: 11,12,13,14,15,16,17,18, 21,22,23,24,25,26,27,28, 31,32... ...86,87,88
	validate_sqr: function( sqr ) {
		return (sqr > 10 && sqr < 89 && sqr % 10 !== 0 && sqr % 10 !== 9);
	},

	// "54" -> [ 5, 4 ]
	sqr_to_xy: function( sqr ) {
		return [ parseInt(sqr[0]), parseInt(sqr[1]) ];
	},

	// [ 5, 4 ] -> "54"
	xy_to_sqr: function( [x,y] ) {
		return "" + x + y;
	},

	// Will convert any number a to [a,-a] except 0 because 0 === -0
	plus_or_minus: function( a ) {
		return !!a ? [ -a, a ] : [0];
	},

	inc_until_false: function( callback, condition, start = 1 ) {
		const result = callback( condition );
		if( condition( result ) ) {
			return [ result, module.exports.inc_until_false( callback, condition, start + 1 ) ];
		}
		return null;
	},

	get_opposite_color: function( color ) {
		if( color === "" ) {
			throw( "Can't get opposite color of empty square." );
		} else {
			return color === "w" ? "b" : "w";
		}
	},

	letter_to_piece: function( letter ) {
		switch( letter ) {
			case "b": return "bishop";
			case "n": return "knight";
			case "k": return "king";
			case "q": return "queen";
			case "r": return "rook";
			case "p": return "pawn";
			default: throw "Invalid piece letter in letter_to_piece."
		}
	},

	// This function takes in the board state, and returns white_callback if the board turn is white's, black_callback if black's
	// Note that they don't necessarily have to be callbacks, they can be anything with a return value
	switch_by_turn: function( board, white_callback, black_callback ) {
		if( board.turn === "w" ) return white_callback;
		if( board.turn === "b" ) return black_callback;
	}
}

})();