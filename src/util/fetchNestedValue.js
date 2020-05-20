/**
 * Given an object and fetch
 * @param {Object} obj 
 * @param {Array<String> | String} path
 */
function fetchNestedValue(obj, path) {
	// Convert path to array
	if(!Array.isArray(path)) {
		return fetchValue(obj, path.toString().split("."));
	}

	// Get the first element, and remove it from the path array
	const key = path.shift();

	// Get the key value
	const val = obj[key];

	// If value is null, terminate and return
	if( val == null ) {
		return val;
	}

	// Recusively call if needed
	if( path.length > 0 ) {
		return fetchValue(val, path);
	}

	// Return the value
	return val;
}

// Export the function
module.exports = fetchNestedValue;