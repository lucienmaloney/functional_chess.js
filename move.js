(function() {
'use strict';

const R      = require('ramda');
const Helper = require('./helper');

// Takes in an array of delta_x and delta_y, returns function that takes in x and y and returns array of all end positions
const move_template = R.lift((delta_x, delta_y) => ((x,y) => [x + delta_x, y + delta_y]));

function create_move_functions( delta_1, delta_2 ) {
	if( !delta_1 && !delta_2 ) throw "A piece cannot have both delta values as 0.";

	// convert to plus or minus so that all directions are covered
	const d1 = Helper.plus_or_minus( delta_1 );
	const d2 = Helper.plus_or_minus( delta_2 );

	// If delta_1 and delta_2 are equal, they should only be crossed once, to avoid duplicates
	if( delta_1 === delta_2 ) {
		return move_template( d1, d2 );
	}
	return R.concat( move_template( d1, d2 ), move_template( d2, d1 )); 
}

//new_coords[1] <= y_pos

function get_moves_list_from_func( func, board, x_pos, y_pos, range, only_forward = false ) {
	const new_coords = func( x_pos, y_pos );
	// If the piece if only allowed to move forward, make sure it only is moving forward:
	if( only_forward ) {
		const white_cond = new_coords[1] <= y_pos;
		const black_cond = new_coords[1] >= y_pos;
		if( Helper.switch_by_turn( board, white_cond, black_cond )) return [];
	}

	const new_pos = Helper.xy_to_sqr( new_coords );
	const valid_sqr = Helper.validate_sqr( new_pos );

	if( valid_sqr && board.square_list[new_pos].side === "" ) {
		// Range is either bool or number. If it's a number, decrement it
		const new_range = typeof(range) === "number" ? range - 1 : range;
		if( !new_range ) {
			return [new_pos];
		}
		const next_steps = get_moves_list_from_func( func, board, new_coords[0], new_coords[1], new_range );
		return [new_pos].concat( next_steps );
	}
	return [];
}

function get_captures_list_from_func( func, board, x_pos, y_pos, range, only_forward = false ) {
	const new_coords = func( x_pos, y_pos );
	if( only_forward && ( board.turn === "w" && new_coords[1] <= y_pos || board.turn === "b" && new_coords[1] >= y_pos )) {
		return [];
	}
	const new_pos = Helper.xy_to_sqr( new_coords );
	const valid_sqr = Helper.validate_sqr( new_pos );
	if( valid_sqr ) {
		const new_pos_side = board.square_list[new_pos].side;
		const new_range = typeof(range) === "number" ? range - 1 : range;
		if( new_pos_side === "" && new_range ) {
			return get_captures_list_from_func( func, board, new_coords[0], new_coords[1], new_range );
		} else if( new_pos_side === Helper.get_opposite_color( board.turn )) {
			return [new_pos];
		}
	}
	return [];
}

function create_moves( function_list, range, only_forward = false ) {
	return function( board, x, y ) {
		const make_moves = f => get_moves_list_from_func( f, board, x, y, range, only_forward );
		return R.flatten( R.map( make_moves, function_list ));			
	}
}

function create_captures( function_list, range, only_forward = false ) {
	return function( board, x, y ) {
		const make_captures = f => get_captures_list_from_func( f, board, x, y, range, only_forward );
		return R.flatten( R.map( make_captures, function_list ));
	}
}

// Movement is the list of functions about how a piece can move
// Range is whether the piece stops after one step or keeps going until hitting a wall or a piece
// Capturing_movement is the list of function denoting how the piece captures. 
// Capturing_movement is the same as movement for all pieces except the pawn
// Ditto for capturing_range
function Piece( movement, range, capturing_movement = movement, capturing_range = range, only_forward = false ) {
	this.get_moves       = create_moves( movement, range, only_forward );
	this.get_captures    = create_captures( capturing_movement, capturing_range, only_forward );
}

module.exports = {
	knight: new Piece( create_move_functions( 1, 2 ), false ),
	bishop: new Piece( create_move_functions( 1, 1 ), true  ),
	rook  : new Piece( create_move_functions( 0, 1 ), true  ),
	queen : new Piece( R.concat( create_move_functions( 1, 1 ), create_move_functions( 0, 1 )), true  ),
	king  : new Piece( R.concat( create_move_functions( 1, 1 ), create_move_functions( 0, 1 )), false ),
	pawn  : new Piece( create_move_functions( 0, 1 ), false, create_move_functions( 1, 1 ), false, true, 2 )
}

})();