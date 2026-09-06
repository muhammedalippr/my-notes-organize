import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mynotes.todo.organize',
  appName: 'My Notes',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#181920',
    allowMixedContent: true
  }
};

export default config;
