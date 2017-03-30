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
	} else if( sqr.piece === "p" ) {
		if( sqr.side === "w" ) {
			if( sqr.y === 2 ) {
				return ( f, board ) => Move.w_pawn_init[f]( board, sqr.x, sqr.y );
			} else {
				return ( f, board ) => Move.w_pawn[f]( board, sqr.x, sqr.y );
			}
		} else if ( sqr.side === "b" ) {
			if( sqr.y === 2 ) {
				return ( f, board ) => Move.b_pawn_init[f]( board, sqr.x, sqr.y );
			} else {
				return ( f, board ) => Move.b_pawn[f]( board, sqr.x, sqr.y );
			}
		}
	} else {
		const piece = Helper.letter_to_piece( sqr.piece );
		return ( f, board ) => Move[piece][f]( board, sqr.x, sqr.y );
	}
	throw "There was an invalid square input to apply_f_to_square: " + sqr.x + sqr.y;
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
	return R.map( f => f( "get_moves", board ), function_list );
}

function get_all_valid_captures( board ) {
	const function_list = apply_to_all_squares( board );
	return R.map( f => f( "get_captures", board ), function_list );
}

function get_valid_castling( board ) {

}

function get_valid_en_passant( board ) {

}

function get_valid_promotion( board ) {

}

function get_all_valid_options( board ) {
	return R.concat(
		format_options( get_all_valid_moves( board ), "move" ),
		format_options( get_all_valid_captures( board ), "capture" )
	);
}

const get_new_turn = board => Helper.get_opposite_color( board.turn );
const get_new_fullmove = board => board.turn === "b" ? board.fullmoves + 1 : board.fullmoves;
const get_new_halfmove = (board, start_sqr) => start_sqr.piece === "p" ? 0 : board.halfmoves + 1;

const get_new_en_passant = function( board, start_sqr, end_sqr ) {
	const is_pawn_move     = start_sqr.piece === "p";
	const is_two_step_move = Math.abs(start_sqr.y - end_sqr.y) === 2;

	if( is_pawn_move && is_two_step_move ) {
		return start_sqr.x.toString() + (( start_sqr.y + end_sqr.y) / 2 );
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

const get_new_board_array_from_move = function( board, start, end ) {
	const sqr_obj   = board.square_list;
	const start_sqr = sqr_obj[start];
	const end_sqr   = sqr_obj[end];
	const new_start = new Square( "", " ", start_sqr.x, start_sqr.y );
	const new_end   = new Square( start_sqr.side, start_sqr.piece, end_sqr.x, end_sqr.y );

	return R.set( R.lensProp(end), new_end, R.set( R.lensProp(start), new_start, sqr_obj ));
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

}

function make_castling( board, start, end ) {

}

function make_en_passant( board, start, end ) {

}

function make_promotion( board, start, end ) {

}

function is_square_attacked( board ) {

}

function get_all_options( board ) {

}

module.exports = {
	get_all_valid_options: get_all_valid_options,
	make_move: make_move
};

})();