(function() {
'use strict';

const R      = require('ramda');
const Helper = require('./helper');
const Move   = require('./move');
const Game   = require('./game');
const Square = require('./square');
const Board  = require('./board');

// Object containing the start and end square, as well as the move type (move or capture)
function Choice( start, end, type ) {
	this.start = start;
	this.end = end;
	this.type = type;
}

// Doesn't actually apply_f_to_square, it returns a function that can be used to apply
function apply_f_to_square( sqr ) {
	if( sqr.side === "" ) {
		throw "Cannot use function apply_f_to_square on a square with no piece in it: " + sqr.x + sqr.y;
	}
	const piece = Helper.letter_to_piece( sqr.piece );
	return ( f, board ) => Move[piece][f]( board, sqr.x, sqr.y );
}

// Turn the object filled with start square keys that point to an array of end squares into a neat object of Choice objects
function format_options( opt_list, opt_type ) {
	const sqr_to_pairs = (val, key, obj) => R.map( v => new Choice( key, v, opt_type ), val );
	const pair_obj = R.mapObjIndexed( sqr_to_pairs, opt_list );
	return R.flatten( R.values( pair_obj ));
}

function apply_to_all_squares( board ) {
	const is_square_valid = sqr => sqr.side === board.turn;
	const squares_to_use = R.filter( is_square_valid, board.square_list );
	return R.map( apply_f_to_square, squares_to_use );
}

function get_all_valid_moves( board ) {
	const function_list = apply_to_all_squares( board );
	return R.map( f => f( "get_moves", board ), function_list );
}

function get_all_valid_captures( board ) {
	const function_list = apply_to_all_squares( board );
	return R.map( f => f( "get_captures", board ), function_list );
}

// Returns function that takes in sqr and returns true if it is attacked
// Note: if it was white's turn this would check if white is attacking a square, not black (see the next function)
function check_for_sqr_attacked( board ) {
	const captures = format_options( get_all_valid_captures(board), "capture" );
	return sqr => R.any( choice => choice.end === sqr, captures );
}

// Same as previous function, but checks if the opposing side is attacking a square
function check_for_sqr_attacked_by_opp_color( board ) {
	const opp_board = R.set( R.lensProp('turn'), Helper.get_opposite_color( board.turn ), board );
	return check_for_sqr_attacked( opp_board );
}

// Requirements for castling are that the king and rook are in their starting places and have not moved,
//   there are no pieces between the king or rook, 
//   and the sqr the king is on, the destination square of the king, and the sqr the king travels through can't be attacked
// These requirements are validated in the below functions:

function test_king_side_castle( board, k, y ) {
	if( R.any( l => l === k, board.castling )) { // Check to be sure castling is still an option
		const sqrs        = board.square_list;
		const sqr_bool    = sqrs["6"+y].side === "" && sqrs["7"+y].side === "";
		const check_check = check_for_sqr_attacked_by_opp_color( board );
		const in_check    = check_check("5"+y) || check_check("6"+y) || check_check("7"+y);
		const correct_p   = sqrs["5"+y].piece === "k" && sqrs["8"+y].piece === "r";
		if( sqr_bool && !in_check && correct_p ) return [k];
	}
	return [];
}

function test_queen_side_castle( board, q, y ) {
	if( R.any( l => l === q, board.castling )) { // Check to be sure castling is still an option
		const sqrs        = board.square_list;
		const sqr_bool    = sqrs["2"+y].side === "" && sqrs["3"+y].side === "" && sqrs["4"+y].side === "";
		const check_check = check_for_sqr_attacked_by_opp_color( board );
		const in_check    = check_check("3"+y) || check_check("4"+y) || check_check("5"+y);
		const correct_p   = sqrs["5"+y].piece === "k" && sqrs["1"+y].piece === "r";
		if( sqr_bool && !in_check && correct_p ) return [q]; 
	}
	return [];
}

function get_valid_castling( board ) {
	// Set the variables to be used:
	const y      = board.turn === "w" ? "1" : "8";
	const k_side = board.turn === "w" ? "K" : "k";
	const q_side = board.turn === "w" ? "Q" : "q";
	const k_side_castle = test_king_side_castle( board, k_side, y );
	const q_side_castle = test_queen_side_castle( board, q_side, y );
	return R.flatten([ k_side_castle, q_side_castle ]);
}

function get_valid_en_passant( board ) {
	if( board.en_passant ) {
		const end_sqr = board.square_list[ board.en_passant ];
		// Direction of y movement changes depending on board turn
		const delta_y = board.turn === "w" ? y => y - 1 : y => y + 1;
		const sqr_1   = "" + (end_sqr.x - 1) + delta_y( end_sqr.y );
		const sqr_2   = "" + (end_sqr.x + 1) + delta_y( end_sqr.y );
		const valid_s = R.filter( s => Helper.validate_sqr( parseInt( s )), [sqr_1, sqr_2] );
		const is_pawn = s => board.square_list[s].piece === "p";
		const is_side = s => board.square_list[s].side  === board.turn;
		return R.filter( s => is_pawn(s) && is_side(s), valid_s );
	}
	return [];
}

function get_pawn_2_step_start_moves( board ) {
	const sqr_fin = sqr => (sqr.x).toString() + (board.turn === "w" ? "4" : "5");
	const sqr_mid = sqr => (sqr.x).toString() + (board.turn === "w" ? "3" : "6");
	const good_piece = sqr => sqr.piece === "p" && sqr.side === board.turn;
	const good_sqr   = sqr => sqr.side === "w" && sqr.y === 2 ||
		                      sqr.side === "b" && sqr.y === 7;
	const good_move  = sqr => Helper.get_side(board, sqr_fin(sqr)) === "" && 
	                          Helper.get_side(board, sqr_mid(sqr)) === "";

	const squares_to_test = R.filter( s => good_piece(s) && good_sqr(s), board.square_list );
	const squares_to_use  = R.filter( good_move, squares_to_test );
	return R.map( s => [sqr_fin(s)], squares_to_use );
}

function get_all_valid_options( board ) {
	return {
		"move": R.flatten([ format_options( get_all_valid_moves( board ), "move" ),
		                    format_options( get_pawn_2_step_start_moves( board ), "move" ) ]),
		"capture": format_options( get_all_valid_captures( board ), "capture" ),
		"castle": get_valid_castling( board ),
		"en_passant": get_valid_en_passant( board )
	};
}

function merge_options( option_list ) {
	return R.flatten( R.values( option_list ));
}

const get_new_turn = board => Helper.get_opposite_color( board.turn );
const get_new_fullmove = board => board.turn === "b" ? board.fullmoves + 1 : board.fullmoves;
const get_new_halfmove = (board, start_sqr) => start_sqr.piece === "p" ? 0 : board.halfmoves + 1;

// If pawn and 2 step move, then there will be an en passant square, else set value of en passant to NaN
const get_new_en_passant = function( board, start_sqr, end_sqr ) {
	const is_pawn_move     = start_sqr.piece === "p";
	const is_two_step_move = Math.abs(start_sqr.y - end_sqr.y) === 2;

	if( is_pawn_move && is_two_step_move ) {
		return Helper.xy_to_sqr([ start_sqr.x, ( start_sqr.y + end_sqr.y) / 2 ]);
	}
	return NaN;
}

const get_new_castling_from_move = function( board, start_sqr ) {
	const p = start_sqr.piece;
	const x = start_sqr.x;
	const is_white = board.turn === "w";
	const castle_str = board.castling;
	if( p === "k" ) {
		return is_white ? R.replace( /KQ/, "", castle_str ) : R.replace( /kq/, "", castle_str );
	} else if( p === "r" && x === 1 ) {
		return is_white ? R.replace( /Q/, "", castle_str ) : R.replace( /q/, "", castle_str );
	} else if( p === "r" && x === 8 ) {
		return is_white ? R.replace( /K/, "", castle_str ) : R.replace( /k/, "", castle_str );
	}
	return castle_str;
}

// This function uses the get castling from move to check if the piece moved was a rook or king
// Also checks to see if captured piece was a rook and updates that accordingly
const get_new_castling_from_capture = function( board, start_sqr, end_sqr ) {
	const p = end_sqr.piece;
	const x = end_sqr.x;
	const is_white = board.turn === "w";
	const move_checked = get_new_castling_from_move( board, start_sqr );
	if( p === "r" && x === 1 ) {
		return is_white ? R.replace( /q/, "", move_checked ) : R.replace( /Q/, "", move_checked );
	} else if( p === "r" && x === 8 ) {
		return is_white ? R.replace( /k/, "", move_checked ) : R.replace( /K/, "", move_checked );
	}
	return move_checked;
}

const get_new_board_array_from_move = function( board, start, end ) {
	const sqr_obj   = board.square_list;
	const start_sqr = sqr_obj[start];
	const end_sqr   = sqr_obj[end];
	const new_start = new Square( "", " ", start_sqr.x, start_sqr.y );
	const new_end   = new Square( start_sqr.side, start_sqr.piece, end_sqr.x, end_sqr.y );

	return R.set( R.lensProp(end), new_end, R.set( R.lensProp(start), new_start, sqr_obj ));
}

function perform_castle( board, y, old_k, old_r, new_k, new_r ) {
	const inty = parseInt(y);
	// Update the four squares that change in a caslting move:
	const old_king = new Square( "", " ", old_k, inty );
	const old_rook = new Square( "", " ", old_r, inty );
	const new_king = new Square( board.turn, "k", new_k, inty );
	const new_rook = new Square( board.turn, "r", new_r, inty );
	// Set each of the squares functionally:
	return R.set( R.lensProp( "" + old_k + y ), old_king,
	       R.set( R.lensProp( "" + old_r + y ), old_rook,
	       R.set( R.lensProp( "" + new_k + y ), new_king,
	       R.set( R.lensProp( "" + new_r + y ), new_rook, board.square_list ))));	
}

function get_new_board_array_from_castle( board, letter, y ) {
	if( R.toUpper( letter ) === "Q" ) {
		return perform_castle( board, y, 5, 1, 3, 4 );
	} else if( R.toUpper( letter ) === "K" ) {
		return perform_castle( board, y, 5, 8, 7, 6 );
	}
	throw "A castling move was attempted with an invalid letter input.";
}

function get_new_board_array_from_en_passant( board, start ) {
	// Get a square for the end sqr (target of pawn that is moving), the passant square (pawn the will be captured), and start sqr
	const end_int   = parseInt( board.en_passant );
	const end_str   = board.en_passant.toString();
	const pass_num  = (board.turn === "w" ? end_int - 1 : end_int + 1 ).toString();
	const pass_sqr  = board.square_list[ pass_num ];
	const start_sqr = board.square_list[ start ];

	// Update each of the squares:
	const new_start = new Square( "", " ", start_sqr.x, start_sqr.y );
	const dead_pawn = new Square( "", " ", pass_sqr.x, pass_sqr.y );
	const new_end   = new Square( start_sqr.side, "p", parseInt(end_str[0]), parseInt(end_str[1]));
	// Set them on the board:
	return R.set( R.lensProp( "" + start_sqr.x + start_sqr.y ), new_start, 
		   R.set( R.lensProp( pass_num ), dead_pawn,
		   R.set( R.lensProp( end_int.toString() ), new_end, board.square_list )));  
}

function make_move( board, start, end ) {
	const start_sqr = board.square_list[start];
	const end_sqr   = board.square_list[end];

	const new_sqr_arr    = get_new_board_array_from_move( board, start, end );
	const new_turn       = get_new_turn( board );
	const new_castling   = get_new_castling_from_move( board, start_sqr );
	const new_en_passant = get_new_en_passant( board, start_sqr, end_sqr );
	const new_halfmoves  = get_new_halfmove( board, start_sqr );
	const new_fullmoves  = get_new_fullmove( board );
	return new Board( new_sqr_arr, new_turn, new_castling, new_en_passant, new_halfmoves, new_fullmoves );
}

function make_capture( board, start, end ) {
	const start_sqr = board.square_list[start];
	const end_sqr   = board.square_list[end];

	const new_sqr_arr    = get_new_board_array_from_move( board, start, end );
	const new_turn       = get_new_turn( board );
	const new_castling   = get_new_castling_from_move( board, start_sqr );
	const new_en_passant = NaN; // En passant can't come after a capture
	const new_halfmoves  = 0;   // Capturing resets halfmove counter to 0
	const new_fullmoves  = get_new_fullmove( board );
	return new Board( new_sqr_arr, new_turn, new_castling, new_en_passant, new_halfmoves, new_fullmoves );
}

function make_castling( board, letter ) {
	// Determine which side of the castling string to replace:
	const y = letter === R.toUpper( letter ) ? "1" : "8";
	const castle_regex = letter === R.toUpper( letter ) ? /KQ/ : /kq/;

	const new_sqr_arr    = get_new_board_array_from_castle( board, letter, y );
	const new_turn       = get_new_turn( board );
	const new_castling   = R.replace( castle_regex, "", board.castling );
	const new_en_passant = NaN; // No en passant after castle
	const new_halfmoves  = board.halfmoves + 1; // Halfmoves must be incremented
	const new_fullmoves  = get_new_fullmove( board );

	return new Board( new_sqr_arr, new_turn, new_castling, new_en_passant, new_halfmoves, new_fullmoves );
}

function make_en_passant( board, start ) {
	const new_sqr_arr    = get_new_board_array_from_en_passant( board, start );
	const new_turn       = get_new_turn( board );
	const new_castling   = board.castling; // There's never a change to castling after an en passant
	const new_en_passant = NaN;            // No en passant after en passant
	const new_halfmoves  = 0;              // Halfmoves must reset after capture
	const new_fullmoves  = get_new_fullmove( board ); 

	return new Board( new_sqr_arr, new_turn, new_castling, new_en_passant, new_halfmoves, new_fullmoves );
}

// update_list_for_promotions is the only function that takes in already finished boards and updates them to fit
function update_list_for_promotion( all_boards ) {
	const is_good_pawn  = sqr => sqr.piece === "p" &&
	                             ((sqr.side === "w" && sqr.y === 8) ||
	                              (sqr.side === "b" && sqr.y === 1));
	const has_promotion = board => R.any( is_good_pawn, R.values( board.square_list ));

	function create_promo_boards( board ) {
		if( !has_promotion( board )) {
			return board;
		}
		const p_sqr   = (R.filter( is_good_pawn, board.square_list ));
		const p_key   = R.keys( p_sqr )[0];
		const p_val   = p_sqr[p_key];
		const p_lens  = R.lensPath([ "square_list", p_key ]);
		const p_set   = sqr => R.set( p_lens, sqr, board );
		const p_piece = piece => new Square( p_val.side, piece, p_val.x, p_val.y );
		const new_squares = R.map( p_piece, ["q","r","b","n"] );
		// Return 4 new boards: 1 where the pawn turns into queen, rook, bishop, and knight each
		return R.map( p_set, new_squares );
	}
	return R.flatten( R.map( create_promo_boards, all_boards ));
}

function check_for_in_check( board ) {
	const opp_color = Helper.get_opposite_color( board.turn );
	const squares = R.values( board.square_list );
	const king_sqr = R.filter( sqr => sqr.piece === "k" && sqr.side === opp_color, squares );
	const king_coords = Helper.xy_to_sqr([ king_sqr[0].x, king_sqr[0].y ]);
	return check_for_sqr_attacked( board )( king_coords );
}

function generate_all_new_boards( board ) {
	const all_options       = get_all_valid_options( board );
	const apply_opt         = (opt, f) => f( board, opt.start, opt.end );
	const move_boards       = R.map( opt => apply_opt( opt, make_move ), all_options.move );
	const capture_boards    = R.map( opt => apply_opt( opt, make_capture ), all_options.capture );
	const castle_boards     = R.map( opt => make_castling( board, opt ), all_options.castle );
	const en_passant_boards = R.map( opt => make_en_passant( board, opt ), all_options.en_passant );

	const all_board = R.flatten([ move_boards, capture_boards, castle_boards, en_passant_boards ]);
	const check_filtered_boards = R.filter( board => !check_for_in_check( board ), all_board );
	return update_list_for_promotion( check_filtered_boards );
}

module.exports = {
	get_all_valid_options: get_all_valid_options,
	make_move: make_move,
	make_capture: make_capture,
	check_for_in_check: check_for_in_check,
	generate_all_new_boards: generate_all_new_boards
};

})();