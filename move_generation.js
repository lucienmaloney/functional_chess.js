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

function make_move( board, start, end ) {
	// array, turn, castling, en passant, halfmoves, fullmoves
	const start_sqr = board.square_list[start];
	const end_sqr = board.square_list[end];
	const sqr_obj = board.square_list;
	const new_sqr_obj = R.set( R.lensProp(end), new Square(start_sqr.side, start_sqr.piece, end_sqr.x, end_sqr.y), R.set( R.lensProp(start), new Square("", " ", start_sqr.x, start_sqr.y), sqr_obj ));
	const new_sqr_arr = R.values( new_sqr_obj );
	const new_fullmoves = board.turn === "b" ? board.fullmoves + 1 : board.fullmoves;
	const new_halfmoves = board.square_list[start].piece === "p" ? 0 : board.halfmoves + 1;
	const new_en_passant = Math.abs(start - end) === 2 && board.square_list[start].piece === "p" ? (0 + start + end) / 2 : NaN;
	const new_castling = "KQkq"; // TEMPORARY
	const new_turn = Helper.get_opposite_color( board.turn );

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