export default class SettingsService {
  static async getSettings() {
    try {
      const { settings = {} } = await chrome.storage.sync.get("settings");
      return settings;
    } catch (error) {
      console.error("Error fetching settings:", error);
      return {};
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
