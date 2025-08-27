const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Expo Metro config
const config = getDefaultConfig(__dirname);

// Add the parent directory to the watchFolders so Metro can find the src files
config.watchFolders = [
  path.resolve(__dirname, '..'), // Parent directory (react-native-tabs-section-list)
];

// Configure resolver to look in the parent directory for modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Allow importing from the parent src directory
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '..', 'node_modules'),
];

module.exports = config;
