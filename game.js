(function() {
'use strict';

const R     = require('ramda');
const MoveG = require('./move_generation');

function log_board( board ) {
	const map_indexed = R.addIndex( R.map );
	const sqr_array = R.reverse( R.transpose( R.splitEvery( 8, R.values(board.square_list))));
	const output_1  = "\x1b[41m     \x1b[42m     ".repeat(4) + "\x1b[0m";
	const output_2  = "\x1b[42m     \x1b[41m     ".repeat(4) + "\x1b[0m";

	const output_square = function( sqr, index, outer_index ) {
		if( (index + outer_index) % 2 ) {
			if( sqr.side === ""  ) return "\x1b[41m     \x1b[0m";
			if( sqr.side === "w" ) return `\x1b[41m  \x1b[37m${ sqr.piece }\x1b[41m  \x1b[0m`;
			if( sqr.side === "b" ) return `\x1b[41m  \x1b[30m${ sqr.piece }\x1b[41m  \x1b[0m`;
		} else {
			if( sqr.side === ""  ) return "\x1b[42m     \x1b[0m";
			if( sqr.side === "w" ) return `\x1b[42m  \x1b[37m${ sqr.piece }\x1b[42m  \x1b[0m`;
			if( sqr.side === "b" ) return `\x1b[42m  \x1b[30m${ sqr.piece }\x1b[42m  \x1b[0m`;			
		}
	}

	const output_line = function( row, index ) {
		if( index % 2 ) {
			console.log( output_1 );
			const squares = map_indexed( (val, idx) => output_square( val, idx, index), row );
			console.log( R.reduce( R.concat, "", squares ));
			console.log( output_1 );
		} else {
			console.log( output_2 );
			const squares = map_indexed( (val, idx) => output_square( val, idx, index), row );
			console.log( R.reduce( R.concat, "", squares ));
			console.log( output_2 );
		}
	}
	map_indexed( output_line, sqr_array );
	console.log("\n\n");
}

function play_random( board, moves ) {
	if( moves ) {
		log_board( board );
		const options = MoveG.get_all_valid_options( board );
		const choice = options[parseInt( Math.random() * options.length )];
		var new_board = 0;
		if( choice.type === "move" ) {
			new_board = MoveG.make_move( board, choice.start, choice.end );
		} else {
			new_board = MoveG.make_move( board, choice.start, choice.end );
		}
		return play_random( new_board, moves - 1 );
	}
	log_board( board );
	return board;
}

module.exports = {
	log_board: log_board,
	play_random: play_random
}

})();