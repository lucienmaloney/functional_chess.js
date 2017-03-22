(function() {
'use strict';

const R = require('ramda');

module.exports = {
	// This function used in replacing the numbers in the fen string
	replace_number_with_that_many_spaces: function( str ) {
		// Function searches within a string for a number. If it finds one, it replaces it with
		// that many spaces. If it doesn't find one, it returns the string.
		const val = str.match(/\d/);
		if(!val) {
			return str;
		}
		const new_str = R.replace( val, " ".repeat(val), str );
		return module.exports.replace_number_with_that_many_spaces( new_str );
	},

	// This function takes an input like "d5" and replaces it with 45; letters to numbers
	// Because chess board is only 8 squares wide, this function only works for first 8 letters
	parse_chess_square: function( sqr ) {
		const alpharray = { "a": 1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8 };
		const letters = sqr.match(/[a-hA-H]/);
		if(!letters) {
			return parseInt(sqr);
		}
		return parse_chess_square( R.replace( letters, alpharray[letters], sqr ) );
	},

	validate_sqr: function( sqr ) {
		// Squares should fall into sequence: 11,12,13,14,15,16,17,18, 21,22,23,24,25,26,27,28, 31,32... ...86,87,88
		return (sqr > 10 && sqr < 89 && sqr % 10 !== 0 && sqr % 10 !== 9);
	}
}

})();