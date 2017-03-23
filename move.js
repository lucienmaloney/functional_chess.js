(function() {
'use strict';

const R      = require('ramda');
const Helper = require('./helper');

const move_template = (delta_1, delta_2) => ((x,y) => [x + delta_1, y + delta_2]);

module.exports = {
	
	create_move_functions: function( delta_1, delta_2 ) {
		if( delta_1 === delta_2 ) {
			return [
						move_template(  delta_1,  delta_1 ),
						move_template( -delta_1,  delta_1 ),
						move_template(  delta_1, -delta_1 ),
						move_template( -delta_1, -delta_1 )
				   ];
		}
		return [
					move_template(  delta_1,  delta_2 ),
					move_template( -delta_1,  delta_2 ),
					move_template(  delta_1, -delta_2 ),
					move_template( -delta_1, -delta_2 ),
					move_template(  delta_2,  delta_1 ),
					move_template( -delta_2,  delta_1 ),
					move_template(  delta_2, -delta_1 ),
					move_template( -delta_2, -delta_1 )
			   ];
	},

	get_moves_list_from_func( func, board, x_pos, y_pos, infinite_range ) {
		const new_coords = func( x_pos, y_pos );
		const new_pos = Helper.xy_to_sqr( new_coords );
		if( board[new_pos].side === "" ) {
			return R.concat( [new_pos], [module.exports.get_moves_list_from_func( func, board, new_coords[0], new_coords[1], infinite_range )] );
		}
		return [];
	}
	/*
	points_to_squares: function( points_list ) {
		return R.map( Helper.xy_to_sqr, points_list );
	},

	validate_move: function( piece_color, sqr ) {
		//return Helper.validate_sqr( sqr ) && 
	},

	generate_move_ray: function( x, y, delta_x, delta_y, board ) {
		const target_sqr = "" + (x + delta_x) + (y + delta_y);
		if( board[target_sqr].side !== board[ Helper.xy_to_sqr( [ x, y ] )].side ) {

		}
	}
	*/
}

})();