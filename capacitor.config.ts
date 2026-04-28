import { CapacitorConfig } from '@capacitor/cli';

const webServerUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_SITE_URL;

const config: CapacitorConfig = {
  appId: 'com.example.toolverse',
  appName: 'Toolverse',
  webDir: 'out',
  server: webServerUrl
    ? {
      url: webServerUrl,
      cleartext: webServerUrl.startsWith('http://'),
    }
    : undefined,
};

export default config;
