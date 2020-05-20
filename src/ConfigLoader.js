//-----------------------------------------------------
//
// Loading external libraries, 
// and local util modules
//
//-----------------------------------------------------

// External libs
const deepmerge = require("deepmerge");

// Project utility functions
const fetchNestedValue   = require("@js-util/fetch-nested-value");

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
 * Build the fully merged config, from the various configured params
 * (Either in an array, or raw form as args)
 * 
 * - file paths
 * - raw config object
 * 
 * @return {Object} Final merged object
 */
function buildMergedConfig(fileList, defaultList) {

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
	return deepmerge.all( fullConfigArray )
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
		let fullConfig = buildMergedConfig({}, fileList, defaultVal);
		
		// Copy it over to self
		for( let key in fullConfig ) {
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
	 * 
	 * @return {*} the nested value if found, else null
	 */
	fetchValue(key) {
		return fetchNestedValue(this, key);
	}
}

// And export
module.exports = ConfigLoader;