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
/*
console.log( chess_board.square_list["31"] );

console.log( Move.knight.get_captures( chess_board, 2, 6 ));
console.log( Move.w_pawn_init.get_moves( chess_board, 3, 2 ));
console.log( Move.knight.get_moves( chess_board, 3, 3 ));
console.log( Move.w_pawn_init.get_captures( chess_board, 3, 2 ));
console.log( Move.w_pawn_init.get_captures( chess_board, 3, 6 ));
console.log( Move.rook.get_moves( chess_board, 3, 3 ));
console.log( Move.rook.get_captures( chess_board, 3, 3 ));

console.log( MoveG.get_all_valid_options( chess_board ));
console.log( chess_board );

console.log( Game.log_board( chess_board ));
*/

Game.log_board( chess_board );
const chess_board2 = MoveG.make_move( chess_board, "42", "44" );
Game.log_board( chess_board2 );
const chess_board3 = MoveG.make_move( chess_board2, "57", "55" );
Game.log_board( chess_board3 );
const chess_board4 = MoveG.make_move( chess_board3, "21", "33" );
Game.log_board( chess_board4 );
const chess_board5 = MoveG.make_move( chess_board4, "48", "84" );
Game.log_board( chess_board5 );
console.log( chess_board5 );

})( "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" );