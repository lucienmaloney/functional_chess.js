(function() {
'use strict';

const R      = require('ramda');
const Helper = require('./helper');
const Square = require('./square');

module.exports = {
	// This function is the first step in getting fen to usable form
	// Function that should follow are validate_fen, create_sqr_array_from_fen, and finally Board constructor
	parse_fen: function( fen_string ) {
		const fen_array = R.split( " ", fen_string );
		return ([Helper.replace_number_with_spaces(fen_array[0]), fen_array[1], fen_array[2],
					Helper.parse_chess_square(fen_array[3]), parseInt(fen_array[4]), parseInt(fen_array[5])]);
	},

	validate_fen: function( board, turn, castling, en_passant, halfmoves, fullmoves ) {
		const setup_bool   = R.all( x => R.length(x) === 8, R.split("/", board) ); // Test each board substring to be 8 squares long
		const len_bool     = R.length( board ) === 71; // Test board string to be 71 long (64 squares + 7 slashes)
		const turn_bool    = turn === "w" || turn === "b";
		// Next line replaces K, Q, k, and q each once with empty string, which should yield empty string as result
		const cas_str_bool = "" === R.replace("q","",R.replace("Q","",R.replace("k","",R.replace("K","",castling))));
		const passant_bool = Number.isNaN(en_passant) || Helper.validate_sqr(en_passant);
		const half_m_bool  = Number.isInteger(halfmoves) && halfmoves >= 0;
		const full_m_bool  = Number.isInteger(fullmoves) && fullmoves >= 1;
		return setup_bool && len_bool && turn_bool && cas_str_bool && passant_bool && half_m_bool && full_m_bool;
	},

	create_sqr_array_from_fen: function( board ) {
		const map_indexed = R.addIndex(R.map);
		const no_slash = str => R.replace( /\//g, "", str ); // Strip slash function
		const get_x = index => index % 8 + 1; // Function that takes index of fen and returns x coord on board
		const get_y = index => 8 - parseInt( index / 8 ); // Same but for y
		const get_side = letter => letter === " " ? "" : letter === R.toUpper(letter) ? "w" : "b"; // Get side returns " ", "b", or "w"
		const get_piece = letter => R.toLower(letter);
		const make_square = (val, idx) => new Square( get_side(val), get_piece(val), get_x(idx), get_y(idx) );
		return map_indexed( make_square, no_slash(board) );
	}

}

})();