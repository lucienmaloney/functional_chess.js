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

const chess_board = FEN.get_board_from_fen( init_fen );
console.log( chess_board["31"] );

console.log( Move.get_knight_moves()( chess_board, 3, 3 ));
console.log( Move.get_rook_moves()( chess_board, 4, 4 ));

})( "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" );