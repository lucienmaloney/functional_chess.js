(function( init_fen ){
'use strict';

const R      = require('ramda');
const Board  = require('./board');
const Square = require('./square');
const FEN    = require('./fen');
const Helper = require('./helper');
const PGN    = require('./pgn');
const Move   = require('./move');
const Game   = require('./game');
const MoveG  = require('./move_generation');

const chess_board = FEN.get_board_from_fen( init_fen );

Game.play_random( chess_board, 10 );

})( "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1" );