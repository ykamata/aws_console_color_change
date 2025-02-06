class SettingsService {
  static async getSettings() {
    try {
      const { settings = CONSTANTS.DEFAULT_SETTINGS } =
        await chrome.storage.sync.get("settings");
      return settings;
    } catch (error) {
      console.error("Error fetching settings:", error);
      return CONSTANTS.DEFAULT_SETTINGS;
    }
  }

  static async updateSettings(settings) {
    try {
      await chrome.storage.sync.set({ settings });
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
    }
  }
}
