module.exports = {
  assets: ['./src/assets/fonts'],
  dependencies: {
    // AppsFlyer runs on Android only for now (see src/services/appsFlyerService.ts): keep it out of the iOS build
    'react-native-appsflyer': { platforms: { ios: null } },
  },
};