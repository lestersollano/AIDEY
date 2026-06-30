const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// pnpm can install multiple physical copies of react-native (different peer
// dependency trees). Metro then bundles each copy separately, and React Native
// startup crashes when the second copy tries to define globals like
// __FUSEBOX_REACT_DEVTOOLS_DISPATCHER__.
const reactNativeRoot = path.dirname(require.resolve('react-native/package.json'));
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native' || moduleName.startsWith('react-native/')) {
    return context.resolveRequest(
      {
        ...context,
        originModulePath: path.join(reactNativeRoot, 'package.json'),
      },
      moduleName,
      platform,
    );
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
