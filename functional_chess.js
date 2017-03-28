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

console.log( Move.knight.get_captures( chess_board, 2, 6 ));
console.log( Move.w_pawn_init.get_moves( chess_board, 3, 2 ));
console.log( Move.knight.get_moves( chess_board, 3, 3 ));
console.log( Move.w_pawn_init.get_captures( chess_board, 3, 2 ));
console.log( Move.w_pawn_init.get_captures( chess_board, 3, 6 ));
console.log( Move.rook.get_moves( chess_board, 3, 3 ));
console.log( Move.rook.get_captures( chess_board, 3, 3 ));

})( "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" );