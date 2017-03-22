(function() {
'use strict';

const R = require('ramda');

module.exports = {
	map_indexed: R.addIndex(R.map),

	// This function used in replacing the numbers in the fen string
	replace_number_with_spaces: function( str ) {
		const val = str.match(/\d/); // Find first number
		if(!val) { // Check if empty
			return str;
		}
		return module.exports.replace_number_with_spaces( R.replace( val, " ".repeat(val), str ) );
	},

	// This function takes an input like "d5" and replaces it with "45"; letters to numbers
	parse_chess_square: function( sqr ) {
		const alpharray = { "a": 1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8 };
		const letters = sqr.match(/[a-zA-Z]/);
		if(!letters) {
			// Note that this will convert the empty fen value "-" to NaN
			// This is okay though, because NaN is falsey
			return parseInt(sqr);
		}
		return parse_chess_square( R.replace( letters, alpharray[letters], sqr ) );
	},

	validate_sqr: function( sqr ) {
		// Squares should fall into sequence: 11,12,13,14,15,16,17,18, 21,22,23,24,25,26,27,28 31,32... ...86,87,88
		return (sqr > 10 && sqr < 89 && sqr % 10 !== 0 && sqr % 10 !== 9);
	}
}

})();