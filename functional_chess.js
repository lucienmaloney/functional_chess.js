(function( init_fen ){
'use strict';

const R = require('ramda');

class Square {
	constructor( side, piece, x, y ) {
		this.side = side;
		this.piece = piece;
		this.x = x;
		this.y = y;
	}
}

class Board {
	constructor( board, turn, castling, en_passant, halfmoves, fullmoves ) {

	}
}

// This function used in replacing the numbers in the fen string
function replace_number_with_spaces( str ) {
	const val = str.match(/\d/); // Find first number
	if(!val) { // Check if empty
		return str;
	}
	return replace_number_with_spaces( R.replace( val, " ".repeat(val), str ) );
}

// This function takes an input like "d5" and replaces it with "45"; letters to numbers
function parse_chess_square( sqr ) {
	const alpharray = { "a": 1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8 };
	const letters = sqr.match(/[a-zA-Z]/);
	if(!letters) {
		// Note that this will convert the empty fen value "-" to NaN
		// This is okay though, because NaN is falsey
		return parseInt(sqr);
	}
	return parse_chess_square( R.replace( letters, alpharray[letters], sqr ) );
}

function parse_fen( fen_string ) {
	const fen_array = R.split( " ", fen_string );
	return ([replace_number_with_spaces(fen_array[0]), fen_array[1], fen_array[2],
				parse_chess_square(fen_array[3]), parseInt(fen_array[4]), parseInt(fen_array[5])]);
}

function validate_sqr( sqr ) {
	return (sqr > 10 && sqr < 89 && sqr % 10 !== 0 && sqr % 10 !== 9);
}

function validate_fen( board, turn, castling, en_passant, halfmoves, fullmoves ) {
	const setup_bool   = R.all( x => R.length(x) === 8, R.split("/", board) );
	const len_bool     = R.length( board ) === 71;
	const turn_bool    = turn === "w" || turn === "b";
	const cas_len_bool = R.length(castling) < 5;
	// Next line replaces K, Q, k, and q each once with empty string, which should yield empty string as result
	const cas_str_bool = "" === R.replace("q","",R.replace("Q","",R.replace("k","",R.replace("K","",castling))));
	const passant_bool = Number.isNaN(en_passant) || validate_sqr(en_passant);
	const half_m_bool  = Number.isInteger(halfmoves) && halfmoves >= 0;
	const full_m_bool  = Number.isInteger(fullmoves) && fullmoves >= 1;
	return setup_bool && len_bool && turn_bool && cas_len_bool && cas_str_bool && passant_bool && half_m_bool && full_m_bool;
}

const fen_arr = parse_fen( init_fen );
console.log(fen_arr);
console.log( validate_fen( ...fen_arr ) );

})( "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" );