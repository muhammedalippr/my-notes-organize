import { AppUpdate, AppUpdateAvailability, FlexibleUpdateInstallStatus } from '@capawesome/capacitor-app-update';

export const AppUpdateService = {
  async checkForUpdate(): Promise<void> {
    try {
      const result = await AppUpdate.getAppUpdateInfo();

      // 1. If an update was already downloaded (e.g. from previous flexible update), complete and restart now
      if (result.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
        await AppUpdate.completeFlexibleUpdate();
        return;
      }

      // 2. If an immediate update is already in progress, resume it
      if (result.updateAvailability === AppUpdateAvailability.UPDATE_IN_PROGRESS) {
        await AppUpdate.performImmediateUpdate();
        return;
      }

      // 3. If an update is available, trigger immediate install flow
      if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
        try {
          await AppUpdate.performImmediateUpdate();
        } catch (immediateErr) {
          console.warn('performImmediateUpdate failed:', immediateErr);
          // If immediate update is rejected by Play Store config, try opening Play Store or fallback
          if (result.flexibleUpdateAllowed) {
            await AppUpdate.addListener('onFlexibleUpdateStateChange', async (state) => {
              if (state.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
                await AppUpdate.completeFlexibleUpdate();
              }
            });
            await AppUpdate.startFlexibleUpdate();
          }
        }
      }
    } catch (error) {
      // In-app updates only trigger in production signed release on Google Play Store
      console.log('In-app update check:', error);
    }
  }
};
