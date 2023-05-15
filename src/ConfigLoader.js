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

// Add fs/path module
const fs = require("fs");
const path = require("path");

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

/**
 * Given a config directory, scan it for all the config files, and import them accordingly
 * This supports jsonc, hjson, json
 * 
 * @param {String} configDir 
 * @returns 
 */
function scanConfigDir(configDir) {
	let configObj = {};

	// Scan the config directory
	let files = fs.readdirSync(configDir);

	// Load the config files
	for(const filename of files) {
		let filePath = path.join(configDir, filename);

		// Check if its a directory
		// If so, recursively scan it
		if( fs.lstatSync(filePath).isDirectory() ) {
			let subConfigObj = scanConfigDir(filePath);

			let fileConfigObj = {};
			fileConfigObj[ filename ] = subConfigObj;

			// merge it
			configObj = configObjectMerge(configObj, fileConfigObj);
			continue;
		}

		// Get the file extension
		let fileExt = path.extname(filename);
		
		// Skip protected keywords
		if( filename == "fetchValue" || filename == "prototype" ) {
			continue;
		}

		// Skip non-config files
		if( fileExt != ".json" && fileExt != ".hjson" && fileExt != ".jsonc" ) {
			continue;
		}

		// Load the config file
		let fileConfig = loadConfigObject(filePath);
		let fileConfigObj = {};
		fileConfigObj[ path.basename(filename, fileExt) ] = fileConfig;

		// Merge it into the config object
		configObj = configObjectMerge(configObj, fileConfigObj);
	}

	return configObj;
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
		let fileList      = options.fileList      || ["./config.json", "./config.hjson"];
		let defaultVal    = options.default       || [ {} ];
		let configDirList = options.configDirList || []
		
		// Config processing
		//------------------------------------------

		// Scan the config directories
		let dirConfigObj = {};
		for(const dir of configDirList) {
			let dirConfig = scanConfigDir(dir);
			configObjectMerge(dirConfigObj, dirConfig);
		}

		// Build the fully merged config
		let fullConfigArray = buildFullConfigArray(dirConfigObj, fileList, defaultVal);
		this._fullConfigArray = fullConfigArray;

		// Lets merge it together
		let mergedConfig = mergeConfigObjects(fullConfigArray);
		this._mergedConfig = mergedConfig;
		
		// Copy it over to self
		for( let key in mergedConfig ) {
			if( key == "fetchValue" || key == "prototype" ) {
				continue;
			}
			this[key] = Object.freeze(mergedConfig[key]);
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
		// let fullConfigArray = this._fullConfigArray;
		// for(let i=0; i<fullConfigArray.length; ++i) {
		// 	let val = fetchNestedValue(fullConfigArray[i], key, null);
		// 	if( val !== null && val !== undefined ) {
		// 		return val;
		// 	}
		// }
		// return fallback;
		return fetchNestedValue( this._mergedConfig, key, fallback );
	}
}

// And export
module.exports = ConfigLoader;