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
		return "" === R.replace("q","",R.replace("Q","",R.replace("k","",R.replace("K","", str )))) ||
		       "" === R.replace("-", "", str);
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

		const no_slash = str => R.replace( /\//g, "", str );
		const get_x_from_fen_index = index => index % 8 + 1;
		const get_y_from_fen_index = index => 8 - parseInt( index / 8 );
		const get_side_from_fen_letter = letter => letter === " " ? "" : letter === R.toUpper(letter) ? "w" : "b";

		const make_square = (val, idx) => new Square( get_side_from_fen_letter(val),
			                                          R.toLower(val),
			                                          get_x_from_fen_index(idx),
			                                          get_y_from_fen_index(idx) 
			                                        );
		return map_indexed( make_square, no_slash(board) );
	},

	// This function goes through all the steps from taking in a fen to creating an array of square objects
	get_board_from_fen: function( fen ) {
		const fen_arr = module.exports.parse_fen( fen );

		if (module.exports.validate_fen(...fen_arr)) {
			const sqr_array = module.exports.create_sqr_array_from_fen(fen_arr[0]);
			const chess = new Board( sqr_array, ...R.tail(fen_arr));
			Object.freeze(chess); // This makes the board immutable
			return chess;
		} else {
			throw "The fen provided is not valid.";
		}
	},

	create_sqr_string_from_board: function( sqrs ) {
		const f = sqr => sqr.side === "w" ? sqr.piece.toUpperCase() : sqr.piece;
		const sep_list   = R.splitEvery( 8, R.join( "", R.map( f, sqrs )));
		const form_list  = R.flatten( R.intersperse( "/", R.reverse( R.transpose( sep_list ))));
		const spaced_out = R.groupWith( (a,b) => a === " " && b === " ", form_list );
		return R.join( "", R.map( l => l[0] === " " ? l.length : l[0], spaced_out ));
	},

	get_fen_from_board: function( board ) {
		const fen_sqr_str = module.exports.create_sqr_string_from_board( R.values( board.square_list ));
		const en_passant  = board.en_passant ? Helper.int_to_letter_sqr( board.en_passant ) : "-";
		return R.join( " ", [fen_sqr_str, board.turn, board.castling, en_passant, board.halfmoves, board.fullmoves] );
	}

}

})();