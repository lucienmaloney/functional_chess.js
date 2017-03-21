(function( init_fen ){
'use strict';

const R = require('ramda');
const map_indexed = R.addIndex(R.map);

class Square {
	constructor( side, piece, x, y ) {
		this.side = side;
		this.piece = piece;
		this.x = x;
		this.y = y;
	}
}

class Board {
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

// This function is the first step in getting fen to usable form
// Function that should follow are validate_fen, create_sqr_array_from_fen, and finally Board constructor
function parse_fen( fen_string ) {
	const fen_array = R.split( " ", fen_string );
	return ([replace_number_with_spaces(fen_array[0]), fen_array[1], fen_array[2],
				parse_chess_square(fen_array[3]), parseInt(fen_array[4]), parseInt(fen_array[5])]);
}

function validate_sqr( sqr ) {
	// Squares should fall into sequence: 11,12,13,14,15,16,17,18, 21,22,23,24,25,26,27,28 31,32... ...86,87,88
	return (sqr > 10 && sqr < 89 && sqr % 10 !== 0 && sqr % 10 !== 9);
}

function validate_fen( board, turn, castling, en_passant, halfmoves, fullmoves ) {
	const setup_bool   = R.all( x => R.length(x) === 8, R.split("/", board) ); // Test each board substring to be 8 squares long
	const len_bool     = R.length( board ) === 71; // Test board string to be 71 long (64 squares + 7 slashes)
	const turn_bool    = turn === "w" || turn === "b";
	// Next line replaces K, Q, k, and q each once with empty string, which should yield empty string as result
	const cas_str_bool = "" === R.replace("q","",R.replace("Q","",R.replace("k","",R.replace("K","",castling))));
	const passant_bool = Number.isNaN(en_passant) || validate_sqr(en_passant);
	const half_m_bool  = Number.isInteger(halfmoves) && halfmoves >= 0;
	const full_m_bool  = Number.isInteger(fullmoves) && fullmoves >= 1;
	return setup_bool && len_bool && turn_bool && cas_str_bool && passant_bool && half_m_bool && full_m_bool;
}

function create_sqr_array_from_fen( board ) {
	const no_slash = str => R.replace( /\//g, "", str ); // Strip slash function
	const get_x = index => index % 8 + 1; // Function that takes index of fen and returns x coord on board
	const get_y = index => 8 - parseInt( index / 8 ); // Same but for y
	const get_side = letter => letter === " " ? "" : letter === R.toUpper(letter) ? "w" : "b"; // Get side returns " ", "b", or "w"
	const get_piece = letter => R.toLower(letter);
	const make_square = (val, idx) => new Square( get_side(val), get_piece(val), get_x(idx), get_y(idx) );
	return map_indexed( make_square, no_slash(board) );
}

const fen_arr = parse_fen( init_fen );
//console.log(fen_arr);
if (validate_fen(...fen_arr)) {
	const chess = new Board(create_sqr_array_from_fen(fen_arr[0]), ...R.tail(fen_arr));
	Object.freeze(chess); // const doesn't make object value immutable, so the additional object.freeze is needed
	console.log( chess["11"] );
} else {
	console.log("The fen provided is not valid.");
}
})( "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" );