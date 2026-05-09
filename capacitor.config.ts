import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.convivia24.app',
  appName: 'Convivia24',
  webDir: 'native-fallback',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://app.convivia24.com',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#f8f6f2',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'Convivia24',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
};

export default config;
