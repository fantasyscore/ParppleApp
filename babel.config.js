module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Reanimated 4.x: this is the canonical worklets plugin.
    // Do NOT also add 'react-native-reanimated/plugin' — it is an alias of
    // this exact module and Babel will report a duplicate plugin.
    'react-native-worklets/plugin', // MUST be last
  ],
};