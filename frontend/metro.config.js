//this code adds support for using .svg files as a react component (using metro, the bulnder)

//get le config
const { getDefaultConfig } = require("@expo/metro-config");
const defaultConfig = getDefaultConfig(__dirname);

//set transformer (make sure it exists/is downloaded)
defaultConfig.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);
//thing that creates components automatically
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
defaultConfig.resolver.sourceExts.push("svg");
//export
module.exports = defaultConfig;

