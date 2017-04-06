(function( init_fen ){
'use strict';

const FEN    = require('./fen');
const Game   = require('./game');

const chess_board = FEN.get_board_from_fen( init_fen );

Game.play_game( chess_board, 10 );

})( "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" );