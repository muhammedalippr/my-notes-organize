import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';

export const AppUpdateService = {
  async checkForUpdate(): Promise<void> {
    try {
      const result = await AppUpdate.getAppUpdateInfo();
      if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
        // Automatically start flexible in-app update for user
        await AppUpdate.startFlexibleUpdate();
      }
    } catch (error) {
      // In-app updates only trigger in production signed release APK on Google Play Store
      console.log('In-app update check:', error);
    }
  }
};
