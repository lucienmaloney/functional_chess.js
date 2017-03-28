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
console.log( Move.get_bishop_moves()( chess_board, 5, 5 ));
console.log( Move.get_white_pawn_moves()( chess_board, 2, 5 ));
console.log( Move.get_black_pawn_moves()( chess_board, 2, 5 ));
console.log( Move.get_queen_moves()( chess_board, 4, 5 ));
console.log( Move.get_king_moves()( chess_board, 5, 5 ));

console.log("\n\n\n");

console.log( Move.get_knight_captures()( chess_board, 3, 3 ));
console.log( Move.get_rook_captures()( chess_board, 4, 4 ));
console.log( Move.get_bishop_captures()( chess_board, 5, 5 ));
console.log( Move.get_white_pawn_captures()( chess_board, 2, 5 ));
console.log( Move.get_black_pawn_captures()( chess_board, 2, 5 ));
console.log( Move.get_queen_captures()( chess_board, 4, 5 ));
console.log( Move.get_king_captures()( chess_board, 5, 5 ));

})( "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" );