# config-loader
Quick and simple config loading, with sane defaults to get an application started

# npm install

```.bash
npm install --save @js-util/config-loader
```

# Example usage

```.js
const ConfigLoader = ("@js-util/config-loader")

//
// Load the various config files (if found),
// along with the various default value fallbacks
//
const config = new ConfigLoader({
	fileList: ["./config.json", "./config.hjson"],
	default: require("./config.default.js")
});

//
// Fetch some config values
//
config.fetchValue("hello.world")
```