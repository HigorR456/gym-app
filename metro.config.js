const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web support (alpha) runs SQLite compiled to WASM
// (wa-sqlite) via SharedArrayBuffer — Metro needs to treat .wasm as a
// servable asset, and the dev server needs COEP/COOP headers for the page
// to be cross-origin isolated (required for SharedArrayBuffer).
// See https://docs.expo.dev/versions/latest/sdk/sqlite/#web-support.
config.resolver.assetExts.push('wasm');

const { enhanceMiddleware } = config.server;
config.server.enhanceMiddleware = (middleware, metroServer) => {
  const withPreviousMiddleware = enhanceMiddleware
    ? enhanceMiddleware(middleware, metroServer)
    : middleware;
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return withPreviousMiddleware(req, res, next);
  };
};

module.exports = withNativeWind(config, { input: './global.css' });
