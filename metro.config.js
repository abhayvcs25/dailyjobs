const { getDefaultConfig } = require("@react-native/metro-config");

const config = getDefaultConfig(__dirname);

// Ignore Android build folders that cause crashes
config.watchFolders = [];
config.resolver.blockList = [
  /android\/app\/\.cxx\/.*/,
  /android\/build\/.*/,
];

module.exports = config;