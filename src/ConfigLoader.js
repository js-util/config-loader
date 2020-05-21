//-----------------------------------------------------
//
// Loading external libraries, 
// and local util modules
//
//-----------------------------------------------------

// Project utility functions
const fetchNestedValue   = require("@js-util/fetch-nested-value");
const configObjectMerge  = require("@js-util/config-object-merge");

// Local utility functions
const arrayConcatNotNull = require("./util/arrayConcatNotNull");
const readHJsonFile      = require("./util/readHJsonFile");

//-----------------------------------------------------
//
// Utility functions
//
//-----------------------------------------------------

/**
 * Load JSON config file, if provided a string.
 * Return its value itself, if its already an object.
 * 
 * @param {*} filePath 
 * 
 * @return {Object} object value equivalent of filePath if valid
 */
function loadConfigObject(filePath) {
	// Load hjson file
	if (typeof filePath === 'string' || filePath instanceof String) {
		return readHJsonFile(filePath);
	}

	// Return the filePath "object" itself
	if(typeof filePath == "object") {
		return filePath;
	}

	// Return null
	return null;
}

/**
 * Build the full array of config objects, from the various configured params
 * (Either in an array, or raw form as args)
 * 
 * - file paths
 * - raw config object
 * 
 * @return {Object} Final merged object
 */
function buildFullConfigArray(fileList, defaultList) {

	// Array concat all the various
	// - file paths
	// - raw config object
	//
	// Either in an array, or raw form
	let fullConfigArray = arrayConcatNotNull.apply(null, arguments);

	// Load the actual value, for each item
	for(let i=fullConfigArray.length-1; i > 0; --i) {
		fullConfigArray[i] = loadConfigObject( fullConfigArray[i] );
	}

	// Filter out null or blank values
	fullConfigArray = fullConfigArray.filter(x => !!x);

	// Time to merge them all
	return fullConfigArray;
}

/**
 * Given an array of config objects, merge them together into a single object
 * 
 * @param {Array<Object>} fullConfigArray 
 * 
 * @return {Object} merged config object
 */
function mergeConfigObjects(fullConfigArray) {
	let res = {};
	for(let i=fullConfigArray.length - 1; i >= 0; --i) {
		res = configObjectMerge(res, fullConfigArray[i]);
	}
	return res;
}

//-----------------------------------------------------
//
// Function implementation
//
//-----------------------------------------------------

/**
 * ConfigLoader class implementation, for full details please refer to the `./README.md`
 **/
class ConfigLoader {

	constructor(options) {
		
		// Options handling
		//------------------------------------------
	
		// Normalize the options object
		options = options || {};
	
		// Normalize the default options value
		let fileList    = options.fileList || ["./config.json", "./config.hjson"];
		let defaultVal  = options.default  || [ {} ];
	
		// Config processing
		//------------------------------------------

		// Build the fully merged config
		let fullConfigArray = buildFullConfigArray({}, fileList, defaultVal);
		this._fullConfigArray = fullConfigArray;

		// Lets merge it together
		let mergedConfig = mergeConfigObjects(fullConfigArray);
		this._mergedConfig = mergedConfig;
		
		// Copy it over to self
		for( let key in mergedConfig ) {
			if( key == "fetchValue" || key == "prototype" ) {
				continue;
			}
			this[key] = Object.freeze(fullConfig[key]);
		}

		// Freeze the values
		Object.freeze(this);
	}

	/**
	 * Fetch a nested value from the config
	 * 
	 * @param {String} key
	 * @param {*} fallback 
	 * 
	 * @return {*} the nested value if found, else null
	 */
	fetchValue(key, fallback) {
		let fullConfigArray = this._fullConfigArray;
		for(let i=0; i<fullConfigArray.length; ++i) {
			let val = fetchNestedValue(fullConfigArray[i], key);
			if( val !== null ) {
				return val;
			}
		}
		return fallback;
	}
}

// And export
module.exports = ConfigLoader;