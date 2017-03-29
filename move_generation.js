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

function get_all_valid_moves( board ) {

}

function get_all_valid_captures( board ) {

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
	apply_f_to_square: apply_f_to_square
};

})();