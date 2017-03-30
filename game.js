(function() {
'use strict';

const R   = require('ramda');

function display_sqr( sqr ) {
	if( sqr.side ) {
		if( sqr.side === "w" ) {
			return "|\x1b[37m\x1b[40m" + sqr.piece.toUpperCase() + "\x1b[0m";
		} else if( sqr.side === "b" ) {
			return "|\x1b[30m\x1b[47m" + sqr.piece.toUpperCase() + "\x1b[0m";
		} else {
			throw "There is a square on the board with an invalid side: " + sqr;
		}
	} else {
		return "| ";
	}
}

module.exports = {
	log_board: function( board ) {
		const sqr_array = R.transpose( R.splitEvery( 8, R.values(board.square_list)));
		const display_sublist = function( sub ) {
			console.log("-----------------");
			console.log( R.reduce( R.concat, "", R.map( display_sqr, sub )) + "|" );
		}
		R.map( display_sublist, sqr_array );
		console.log("-----------------");
	}
}

})();