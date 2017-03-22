(function( init_fen ){
'use strict';

const R      = require('ramda');
const Board  = require('./board');
const Square = require('./square');
const Fen    = require('./fen');

const fen_arr = Fen.parse_fen( init_fen );
//console.log(fen_arr);
if (Fen.validate_fen(...fen_arr)) {
	const chess = new Board(Fen.create_sqr_array_from_fen(fen_arr[0]), ...R.tail(fen_arr));
	Object.freeze(chess); // const doesn't make object value immutable, so the additional object.freeze is needed
	console.log( chess["11"] );
} else {
	console.log("The fen provided is not valid.");
}
})( "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" );