(function() {
'use strict';

const R      = require('ramda');
const Helper = require('./helper');
const Move   = require('./move');

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

function make_move( board ) {

}

function make_capture( board ) {

}

function make_castling( board ) {

}

function make_en_passant( board ) {

}

function make_promotion( board ) {

}

function is_square_attacked( board ) {

}

function get_all_options( board ) {

}

module.exports = {
	apply_f_to_square: apply_f_to_square,
	apply_to_all_squares: apply_to_all_squares,
	get_all_valid_moves: get_all_valid_moves,
	get_all_valid_captures: get_all_valid_captures
};

})();