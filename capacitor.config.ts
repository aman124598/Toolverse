import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.toolverse',
  appName: 'Toolverse',
  webDir: 'out',
  server: {
    url: 'https://tooolverse.vercel.app',
    cleartext: false,
  },
};

export default config;
