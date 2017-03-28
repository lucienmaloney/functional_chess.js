(function() {
'use strict';

const R      = require('ramda');
const Helper = require('./helper');

const move_template = R.lift((delta_x, delta_y) => ((x,y) => [x + delta_x, y + delta_y]));

function create_move_functions( delta_1, delta_2 = delta_1 ) {
	const d1 = [ delta_1, -delta_1 ];
	const d2 = [ delta_2, -delta_2 ];
	if( !delta_1 && !delta_2 ) {
		throw "A piece cannot have both delta values as 0.";
	} else if( !delta_1 ) { // If delta_1 === 0
		return R.concat( move_template( [delta_1], d2 ), move_template( d2, [delta_1] ));
	} else if( !delta_2 ) { // If delta_2 === 0
		return R.concat( move_template( [delta_2], d1 ), move_template( d1, [delta_2] ));
	} else if( delta_1 === delta_2 ) {
		return move_template( d1, d1 );
	}
	return R.concat( move_template( d1, d2 ), move_template( d2, d1 )); 
}

function get_moves_list_from_func( func, board, x_pos, y_pos, infinite_range ) {
	const new_coords = func( x_pos, y_pos );
	const new_pos = Helper.xy_to_sqr( new_coords );
	if( Helper.validate_sqr( new_pos ) && board[new_pos].side === "" ) {
		if( !infinite_range ) {
			return new_pos;
		}
		return R.concat( [new_pos], get_moves_list_from_func( func, board, new_coords[0], new_coords[1], infinite_range ) );
	}
	return [];
}

function get_captures_list_from_func( func, board, x_pos, y_pos, infinite_range ) {
	const new_coords = func( x_pos, y_pos );
	const new_pos = Helper.xy_to_sqr( new_coords );
	const valid_sqr = Helper.validate_sqr( new_pos );
	if( valid_sqr ) {
		const new_pos_side = board[new_pos].side;
		if( new_pos_side === "" && infinite_range ) {
			return get_captures_list_from_func( func, board, new_coords[0], new_coords[1], infinite_range );
		} else if( new_pos_side === Helper.get_opposite_color( board.turn )) {
			return new_pos;
		}
	}
	return [];
}

function create_moves( function_list, range_bool ) {
	return function( board, x, y ) {
		const make_moves = f => get_moves_list_from_func( f, board, x, y, range_bool );
		return R.flatten( R.map( make_moves, function_list ));			
	}
}

function create_captures( function_list, range_bool ) {
	return function( board, x, y ) {
		const make_captures = f => get_captures_list_from_func( f, board, x, y, range_bool );
		return R.flatten( R.map( make_captures, function_list ));
	}
}

function Piece( movement, range ) {
	this.movement = movement;
	this.range    = range;
}

const knight = new Piece( create_move_functions( 1, 2 ), false );
const bishop = new Piece( create_move_functions( 1    ), true  );
const rook   = new Piece( create_move_functions( 0, 1 ), true  );
const queen  = new Piece( R.concat( create_move_functions( 1 ), create_move_functions( 0, 1 )), true  );
const king   = new Piece( R.concat( create_move_functions( 1 ), create_move_functions( 0, 1 )), false );

module.exports = {
	get_knight_moves: () => create_moves( knight.movement, knight.range ),
	get_bishop_moves: () => create_moves( bishop.movement, bishop.range ),
	get_rook_moves:   () => create_moves( rook.movement,   rook.range   ),
	get_queen_moves:  () => create_moves( queen.movement,  queen.range  ),
	get_king_moves:   () => create_moves( king.movement,   king.range   ),

	get_knight_captures: () => create_captures( knight.movement, knight.range ),
	get_bishop_captures: () => create_captures( bishop.movement, bishop.range ),
	get_rook_captures:   () => create_captures( rook.movement,   rook.range   ),
	get_queen_captures:  () => create_captures( queen.movement,  queen.range  ),
	get_king_captures:   () => create_captures( king.movement,   king.range   ),

	// Pawns can only move forward, so white can only move in +y direction, and black in -y:
	get_white_pawn_moves:  () => create_moves( move_template( [0], [ 1] ), false ),
	get_black_pawn_moves:  () => create_moves( move_template( [0], [-1] ), false ),

	get_white_pawn_captures: () => create_captures( move_template( [-1, 1], [ 1] ), false ),
	get_black_pawn_captures: () => create_captures( move_template( [-1, 1], [-1] ), false )
}

})();