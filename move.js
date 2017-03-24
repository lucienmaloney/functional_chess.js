(function() {
'use strict';

const R      = require('ramda');
const Helper = require('./helper');

const move_template = (delta_1, delta_2) => ((x,y) => [x + delta_1, y + delta_2]);

function create_move_functions( delta_1, delta_2 = delta_1 ) {
	if( delta_1 === delta_2 ) {
		return [
					move_template(  delta_1,  delta_1 ),
					move_template( -delta_1,  delta_1 ),
					move_template(  delta_1, -delta_1 ),
					move_template( -delta_1, -delta_1 )
			   ];
	}
	return R.uniq([
				move_template(  delta_1,  delta_2 ),
				move_template( -delta_1,  delta_2 ),
				move_template(  delta_1, -delta_2 ),
				move_template( -delta_1, -delta_2 ),
				move_template(  delta_2,  delta_1 ),
				move_template( -delta_2,  delta_1 ),
				move_template(  delta_2, -delta_1 ),
				move_template( -delta_2, -delta_1 )
		   ]);
}

function neaten_move_list( list ) {
	return R.flatten( list );
}

function create_moves( function_list, range_bool ) {
	return function( board, x, y ) {
		const make_moves = f => module.exports.get_moves_list_from_func( f, board, x, y, range_bool );
		return R.map( make_moves, function_list );			
	}
}

module.exports = {

	get_moves_list_from_func: function( func, board, x_pos, y_pos, infinite_range ) {
		const new_coords = func( x_pos, y_pos );
		const new_pos = Helper.xy_to_sqr( new_coords );
		console.log( new_pos );
		if( Helper.validate_sqr( new_pos ) && board[new_pos].side === "" ) {
			if( !infinite_range ) {
				return new_pos;
			}
			return R.concat( [new_pos], module.exports.get_moves_list_from_func( func, board, new_coords[0], new_coords[1], infinite_range ) );
		}
		return [];
	},

	get_knight_moves: () => create_moves( create_move_functions( 1, 2 ), false ),
	get_bishop_moves: () => create_moves( create_move_functions( 1    ), true  ),
	get_rook_moves:   () => create_moves( create_move_functions( 0, 1 ), true  ),
	get_pawn_moves:   () => create_moves( move_template( 0, 1 ), false ),
	get_queen_moves:  () => create_moves( R.concat( create_move_functions( 1 ), create_move_functions( 0, 1 )), true  ),
	get_king_moves:   () => create_moves( R.concat( create_move_functions( 1 ), create_move_functions( 0, 1 )), false )
}

})();