module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native|@react-navigation|@supabase|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|react-native-reanimated|react-native-url-polyfill|react-native-get-random-values|react-native-config|mixpanel-react-native|react-native-purchases|uuid|@testing-library)',
  ],
  moduleNameMapper: {
    '^test-renderer$': 'react-test-renderer',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
