(function() {
'use strict';

const R     = require('ramda');
const MoveG = require('./move_generation');

function display_sqr( sqr ) {
	if( sqr.side ) {
		if( sqr.side === "w" ) {
			return "   \x1b[30m\x1b[47m" + sqr.piece.toUpperCase() + "\x1b[0m";
		} else if( sqr.side === "b" ) {
			return "   \x1b[37m\x1b[40m" + sqr.piece.toUpperCase() + "\x1b[0m";
		} else {
			throw "There is a square on the board with an invalid side: " + sqr;
		}
	}
	if( (sqr.x + sqr.y) % 2 ) {
		return "\x1b[32m   *\x1b[0m";
	} else {
		return "\x1b[37m   *\x1b[0m";
	}
}

function log_board( board ) {
	const sqr_array = R.reverse( R.transpose( R.splitEvery( 8, R.values(board.square_list))));
	console.log("_______________________________________");
	console.log("|                                     |");
	const display_sublist = function( sub ) {
		console.log("|                                     |");
		console.log( "|", R.reduce( R.concat, "", R.map( display_sqr, sub )), "   |" );
	}
	R.map( display_sublist, sqr_array );
	console.log("|                                     |");
	console.log("_______________________________________");
	return "\n";
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