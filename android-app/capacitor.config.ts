import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.yinji.smartdiary',
  appName: '映记',
  webDir: '../frontend/dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      backgroundColor: '#fff8f4',
      showSpinner: false,
    },
  },
}

export default config
