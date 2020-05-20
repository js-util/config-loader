const fse       = require("fs-extra");
const hjson     = require("hjson");

/**
 * Given a file path, load and return its HJSON value
 * @param {String} filePath 
 * 
 * @return {*} JSON object inside the hjson file
 **/
function readHJsonFile(filePath) {
	// Return null
	if( !fse.pathExistsSync(filePath) ) {
		return null;
	}
	// Get the data and convert it
	const data = fse.readFileSync(filePath);
	return hjson.parse(data);
}

// Export the function
module.exports = readHJsonFile;