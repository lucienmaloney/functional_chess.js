(function() {
'use strict';

const R     = require('ramda');
const MoveG = require('./move_generation');

const map_indexed = R.addIndex( R.map );

// \x1b[0m in both output_square and output_line reset the console.log color and bgcolor
// Each square is 5 wide by 3 tall, which forms about a square in the console

const output_square = function( sqr, index, outer_index, bg_1, bg_2 ) {
	const bg = ( index + outer_index ) % 2 === 1 ? bg_1 : bg_2;
	// 5 spaces or 2 spaces + 1 piece + 2 spaces both equal 1 square width
	if( sqr.side === ""  ) return bg + "     \x1b[0m";
	if( sqr.side === "w" ) return bg + `  \x1b[37m${ sqr.piece.toUpperCase() }` + bg + `  \x1b[0m`;
	if( sqr.side === "b" ) return bg + `  \x1b[30m${ sqr.piece.toUpperCase() }` + bg + `  \x1b[0m`;
}

const output_line = function( row, index, bg_1, bg_2 ) {
	// A line is 5 spaces of a color followed by 5 spaces of another color, repeat that 4 times.
	// This gets the checkerboard pattern
	const bg_line = ( color_1, color_2 ) => ( color_1 + "     " + color_2 + "     " ).repeat(4) + "\x1b[0m";
	const output  = index % 2 === 1 ? bg_line( bg_1, bg_2 ) : bg_line( bg_2, bg_1 );
	const squares = map_indexed( (val, idx) => output_square( val, idx, index, bg_1, bg_2 ), row );

	console.log( output );
	console.log( R.reduce( R.concat, "", squares ));
	console.log( output );
}

function log_board( board ) {
	// sqr_array splits up the board into its rows so the rows can be mapped over and logged
	const sqr_array = R.reverse( R.transpose( R.splitEvery( 8, R.values( board.square_list ))));
	const bg_1 = "\x1b[41m"; // Red, because it contrasts with both the black and white pieces
	const bg_2 = "\x1b[42m"; // Green, for the same reason
	map_indexed(( val, idx ) => output_line( val, idx, bg_1, bg_2 ), sqr_array );
	console.log("\n\n");
}

function play_random( board, moves = 1 ) {
	if( moves ) {
		log_board( board );
		const options = MoveG.generate_all_new_boards( board );
		const choice = options[ parseInt( Math.random() * options.length ) ];
		return play_random( choice, moves - 1 );
	}
	log_board( board );
	return board;
}

module.exports = {
	log_board: log_board,
	play_random: play_random
}

})();