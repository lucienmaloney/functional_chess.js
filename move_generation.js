(function() {
'use strict';

const R      = require('ramda');
const Helper = require('./helper');
const Move   = require('./move');
const Game   = require('./game');
const Square = require('./square');
const Board  = require('./board');

function apply_f_to_square( sqr ) {
	if( sqr.side === "" ) {
		throw "Cannot use function apply_f_to_square on a square with no piece in it: " + sqr.x + sqr.y;
	}
	const piece = Helper.letter_to_piece( sqr.piece );
	return ( f, board ) => Move[piece][f]( board, sqr.x, sqr.y );
}

function Choice( start, end, type ) {
	this.start = start;
	this.end = end;
	this.type = type;
}

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
	const valid_moves = R.map( f => f( "get_moves", board ), function_list );
	return valid_moves;
}

function get_all_valid_captures( board ) {
	const function_list = apply_to_all_squares( board );
	return R.map( f => f( "get_captures", board ), function_list );
}

function check_for_sqr_attacked( board ) {
	const captures = format_options( get_all_valid_captures(board), "capture" );
	return sqr => R.any( choice => choice.end === sqr, captures );
}

function test_king_side_castle( board, k, y ) {
	if( R.any( l => l === k, board.castling )) {
		const sqrs        = board.square_list;
		const opp_board   = R.set( R.lensProp('turn'), Helper.get_opposite_color( board.turn ), board );
		const sqr_bool    = sqrs["6"+y].side === "" && sqrs["7"+y].side === "";
		const check_check = check_for_sqr_attacked( opp_board );
		const in_check    = check_check("5"+y) || check_check("6"+y) || check_check("7"+y);
		if( sqr_bool && !in_check ) return [k];
	}
	return [];
}

function test_queen_side_castle( board, q, y ) {
	if( R.any( l => l === q, board.castling )) {
		const sqrs        = board.square_list;
		const opp_board   = R.set( R.lensProp('turn'), Helper.get_opposite_color( board.turn ), board );
		const sqr_bool    = sqrs["2"+y].side === "" && sqrs["3"+y].side === "" && sqrs["4"+y].side === "";
		const check_check = check_for_sqr_attacked( opp_board );
		const in_check    = check_check("3"+y) || check_check("4"+y) || check_check("5"+y);
		if( sqr_bool && !in_check ) return [q]; 
	}
	return [];
}

function get_valid_castling( board ) {
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
	const good_sqr   = sqr => (sqr.side === "w" && sqr.y === 2 || sqr.side === "b" && sqr.y === 7);
	const good_move  = sqr => board.square_list[sqr_fin(sqr)].side === "" && board.square_list[sqr_mid(sqr)].side === "";

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

function get_new_board_array_from_castle( board, letter, y ) {
	const inty = parseInt(y);
	if( R.toUpper( letter ) === "Q" ) {
		const old_king = new Square( "", " ", 5, inty );
		const old_rook = new Square( "", " ", 1, inty );
		const new_king = new Square( board.turn, "k", 3, inty );
		const new_rook = new Square( board.turn, "r", 4, inty );
		return R.set( R.lensProp( "5" + y ), old_king,
		       R.set( R.lensProp( "1" + y ), old_rook,
		       R.set( R.lensProp( "3" + y ), new_king,
		       R.set( R.lensProp( "4" + y ), new_rook, board.square_list ))));
	} else if( R.toUpper( letter ) === "K" ) {
		const old_king = new Square( "", " ", 5, inty );
		const old_rook = new Square( "", " ", 8, inty );
		const new_king = new Square( board.turn, "k", 7, inty );
		const new_rook = new Square( board.turn, "r", 6, inty );
		return R.set( R.lensProp( "5" + y ), old_king,
		       R.set( R.lensProp( "8" + y ), old_rook,
		       R.set( R.lensProp( "7" + y ), new_king,
		       R.set( R.lensProp( "6" + y ), new_rook, board.square_list ))));
	}
	throw "A castling move was attempted with an invalid letter input.";
}

function get_new_board_array_from_en_passant( board, start ) {
	const end_int   = parseInt( board.en_passant );
	const end_str   = board.en_passant.toString();
	const pass_num  = (board.turn === "w" ? end_int - 1 : end_int + 1 ).toString();
	const start_sqr = board.square_list[ start ];
	const new_start = new Square( "", " ", start_sqr.x, start_sqr.y );
	const pass_sqr  = board.square_list[ pass_num ];
	const dead_pawn = new Square( "", " ", pass_sqr.x, pass_sqr.y );
	const new_end   = new Square( start_sqr.side, "p", parseInt(end_str[0]), parseInt(end_str[1]));
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
	const new_en_passant = NaN;
	const new_halfmoves  = 0;
	const new_fullmoves  = get_new_fullmove( board );
	return new Board( new_sqr_arr, new_turn, new_castling, new_en_passant, new_halfmoves, new_fullmoves );
}

function make_castling( board, letter ) {
	const y = letter === R.toUpper( letter ) ? "1" : "8";
	const castle_regex = letter === R.toUpper( letter ) ? /KQ/ : /kq/;
	const new_sqr_arr    = get_new_board_array_from_castle( board, letter, y );
	const new_turn       = get_new_turn( board );
	const new_castling   = R.replace( castle_regex, "", board.castling );
	const new_en_passant = NaN;
	const new_halfmoves  = board.halfmoves + 1;
	const new_fullmoves  = get_new_fullmove( board );

	return new Board( new_sqr_arr, new_turn, new_castling, new_en_passant, new_halfmoves, new_fullmoves );
}

function make_en_passant( board, start ) {
	const new_sqr_arr    = get_new_board_array_from_en_passant( board, start );
	const new_turn       = get_new_turn( board );
	const new_castling   = board.castling;
	const new_en_passant = NaN;
	const new_halfmoves  = 0;
	const new_fullmoves  = get_new_fullmove( board ); 

	return new Board( new_sqr_arr, new_turn, new_castling, new_en_passant, new_halfmoves, new_fullmoves );
}

function update_list_for_promotion( all_boards ) {
	const is_good_pawn  = sqr => sqr.piece === "p" && (sqr.side === "w" && sqr.y === 8) || (sqr.side === "b" && sqr.y === 1);
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