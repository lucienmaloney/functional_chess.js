(function() {
'use strict';

const R      = require('ramda');
const Helper = require('./helper');
const Square = require('./square');
const Board  = require('./board');

module.exports = {

	// This function gets fen into form where it can be validated and converted into a square array
	parse_fen: function( fen_string ) {
		const fen_array = R.split( " ", fen_string );
		return ([ Helper.replace_number_with_that_many_spaces(fen_array[0]),
					fen_array[1], 
					fen_array[2],
					Helper.parse_chess_square(fen_array[3]), 
					parseInt(fen_array[4]), 
					parseInt(fen_array[5])
				]);
	},

	// TODO: Check that the pieces on the board are all valid pieces
	validate_fen: function( board, turn, castling, en_passant, halfmoves, fullmoves ) {
		// Test each board substring to be 8 chars/squares long:
		const setup_bool   = R.all( x => R.length(x) === 8, R.split("/", board) );
		// Test board string to be 71 chars long (64 squares + 7 slashes)
		const len_bool     = R.length( board ) === 71;
		// Test turn is one of two valid values: 'w' or 'b'
		const turn_bool    = turn === "w" || turn === "b";
		// Test that removing "K" "Q" "k" and "q" in castling string yields an empty string
		const cas_str_bool = "" === R.replace("q","",R.replace("Q","",R.replace("k","",R.replace("K","",castling))));
		// Test that en_passant square is valid. If there is no en passant square, NaN is the accepted value
		const passant_bool = Number.isNaN(en_passant) || Helper.validate_sqr(en_passant);
		// Check that halfmoves and fullmoves fall inside their necessary ranges
		const half_m_bool  = Number.isInteger(halfmoves) && halfmoves >= 0 && halfmoves < 100;
		const full_m_bool  = Number.isInteger(fullmoves) && fullmoves >= 1;

		// Finally, check to be sure all of these conditions are met
		return setup_bool && len_bool && turn_bool && cas_str_bool && passant_bool && half_m_bool && full_m_bool;
	},

	create_sqr_array_from_fen: function( board ) {
		// map_indexed is like map but it also takes in an index
		const map_indexed = R.addIndex(R.map);
		// no_slash strips all slashes
		const no_slash = str => R.replace( /\//g, "", str );
		// get_x and get_y both take the index of the char in the string to determine its x and y coords on the board
		const get_x = index => index % 8 + 1;
		const get_y = index => 8 - parseInt( index / 8 );
		// Get side returns "", "w", or "b"
		const get_side = letter => letter === " " ? "" : letter === R.toUpper(letter) ? "w" : "b";
		// get_piece sets piece to lowercase for consistency
		const get_piece = letter => R.toLower(letter);
		// Finally, make_square takes all of these functions and uses them to create a square object
		const make_square = (val, idx) => new Square( get_side(val), get_piece(val), get_x(idx), get_y(idx) );
		return map_indexed( make_square, no_slash(board) );
	},

	// This function goes through all the steps from taking in a fen to creating an array of square objects
	get_board_from_fen: function( fen ) {
		const fen_arr = module.exports.parse_fen( fen );

		if (module.exports.validate_fen(...fen_arr)) {
			const chess = new Board(module.exports.create_sqr_array_from_fen(fen_arr[0]), ...R.tail(fen_arr));
			// const doesn't make object values immutable, so the additional object.freeze is needed
			Object.freeze(chess);
			return chess;
		} else {
			throw "The fen provided is not valid.";
		}
	}

}

})();