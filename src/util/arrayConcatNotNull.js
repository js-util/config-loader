
/**
 * Minimal varient of ArrayConcatIfNotNull
 * 
 * @param {Array<*>} array result to clone and add into
 * @param {*} val to concat, if not null
 */
function arrayConcatIfNotNull_minimal( array, val ) {
	// Normalize the array object
	if( !Array.isArray(array) ) {
		array = [ array ];
	}

	// Does nothing if null
	if( val == null ) {
		return res;
	}

	// As confusing as it seems, concat and the following
	// line produces the same result.
	//
	// ```
	// if( Array.isArray(val) ) {
	// 	res = ret.concat(val);
	// }
	// res.push( val );
	// ```
	return array.concat( val );
}
/**
 * 
 * @param {*} args raw arguments array
 */
function arrayConcatIfNotNull_rawArgs( args ) {
	// Prepare the return array
	let array = [];

	// For each argument, process it
	for(let i=0; i<args.length; ++i) {
		array = arrayConcatIfNotNull_minimal( array, args[i] );
	}

	// Return the final result
	return array;
}

/**
 * Given the value, if its an array, merge its value into the result array.
 * Else if its not an array (ie, string or object). "Push" into the result array.
 * 
 * Finally if val is null, does nothing and just return the result
 * 
 * @param {Array<*>} array result to clone and add into
 * @param {*} val to concat into, if not null
 * @param {*} ... optional additional values
 * 
 */
function arrayConcatIfNotNull( array, val ) {
	// Handle the multiple arguments
	if( arguments.length >= 3 ) {
		return arrayConcatIfNotNull_rawArgs( arguments );
	}

	// Handle the minial args
	return arrayConcatIfNotNull_minimal( array, val );
}

// Export the function
module.exports = arrayConcatIfNotNull;
