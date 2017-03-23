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

	validate_pieces: function( str ) {
		return "" === R.replace( / |r|n|b|q|k|p|R|N|B|Q|K|P|\//g, "", str );
	},

	validate_board_str: function( str ) {
		const split_board = R.split( "/", str );
		const board_has_8_rows = R.length( split_board ) === 8;
		const each_row_has_8_columns = R.all( x => R.length(x) === 8, split_board );

		return board_has_8_rows && each_row_has_8_columns && module.exports.validate_pieces( str );
	},

	validate_turn: function( turn ) {
		return turn === "w" || turn === "b";
	},

	// A valid castling string should contain just the letters "q" "Q" "k" and "K" either once or zero times
	// Replacing each of these letters with an empty char should yield an empty string in a valid castle_str
	validate_castle_str: function( str ) {
		return "" === R.replace("q","",R.replace("Q","",R.replace("k","",R.replace("K","", str ))));
	},

	// value of en_passant should either be a valid square, or if no en_passant is possible than NaN
	validate_en_passant: function( sqr ) {
		return Number.isNaN( sqr ) || Helper.validate_sqr( sqr );
	},

	validate_halfmove: function( halfmove ) {
		return Number.isInteger( halfmove ) && halfmove >= 0 && halfmove < 100;
	},

	validate_fullmove: function( fullmove ) {
		return Number.isInteger( fullmove ) && fullmove >= 1;
	},

	validate_fen: function( board, turn, castling, en_passant, halfmoves, fullmoves ) {
		return module.exports.validate_board_str( board ) &&
			   module.exports.validate_turn( turn ) &&
			   module.exports.validate_castle_str( castling ) &&
			   module.exports.validate_en_passant( en_passant ) &&
			   module.exports.validate_halfmove( halfmoves ) &&
			   module.exports.validate_fullmove( fullmoves );
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