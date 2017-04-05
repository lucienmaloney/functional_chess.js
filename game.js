(function() {
'use strict';

const R      = require('ramda');
const MoveG  = require('./move_generation');
const Helper = require('./helper');
const FEN    = require('./fen');

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

function determine_insufficient_material( board ) {
	const squares    = R.values( board.square_list );
	const filtered   = R.filter( s => s.side !== "", squares );
	const len        = filtered.length;
	const any_knight = R.any( s => s.piece === "n", filtered );
	const any_bishop = R.any( s => s.piece === "b", filtered );
	const w_bishop   = R.filter( s => s.piece === "b" && s.side === "w", filtered );
	const b_bishop   = R.filter( s => s.piece === "b" && s.side === "b", filtered );
	const not_enough = len === 2 || (len === 3 && (any_bishop || any_knight));
	if( w_bishop.length === 1 && b_bishop.length === 1 && len === 4 ) {
		return ((w_bishop[0].x + w_bishop[0].y) % 2 === (b_bishop[0].x + b_bishop[0].y) % 2) || not_enough;
	}
	return not_enough;
}

function detect_3_repetition( fen_list ) {
	const counted = R.countBy( l => l.slice( 0, -3 ))( fen_list );
	return R.any( v => v >= 3, R.values( counted ));
}

function test_for_game_end( board, options, fen_list ) {
	if( !options.length ) {
		const opp_board = R.set( R.lensProp("turn"), Helper.get_opposite_color( board.turn ), board );
		if( MoveG.check_for_in_check( opp_board )) return "Checkmate";
		return "Stalemate";
	}
	if( board.halfmoves >= 100 ) return "50 Move Rule";
	if( determine_insufficient_material( board )) return "Insufficient Material";
	if( detect_3_repetition( fen_list )) return "3-fold Repetition";
	return "";
}

function end_game( board, game_state ) {
	console.log( game_state );
}

// Choose a random move from the options and return it:
function play_random( opt_list ) {
	return opt_list[ parseInt( Math.random() * opt_list.length ) ];
}

// Move limit by default is set to 1, allowing only 1 move before the program stops
// Setting the move_limit to a negative number allows for unlimited moves (until a game ending condition is met)
function play_game( board, move_limit = 1, algorithm_cb = play_random, fen_list = [] ) {
	if( move_limit ) {
		log_board( board );

		// Generate the complete list of following board states from legal moves and choose one
		const options = MoveG.generate_all_new_boards( board );
		const choice = algorithm_cb( options );

		// Check for if the game is over in any way: 
		// FEN list is needed to test for threefold repetition and to keep track of changes to undo
		const new_fen_list = R.concat( fen_list, [FEN.get_fen_from_board( board )]);
		const game_state = test_for_game_end( board, options, new_fen_list );
		if( game_state ) return end_game( board, game_state );

		return play_game( choice, move_limit - 1, algorithm_cb, new_fen_list );
	}
	// These lines only run if the maximum move limit is exceeded:
	log_board( board );
	return board;
}

module.exports = {
	play_game: play_game
}

})();