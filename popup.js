import { MESSAGES } from "./constants.js";
import SettingsService from "./settingsService.js";
import UIManager from "./uiManager.js";

chrome.runtime.connect({ name: MESSAGES.POPUP_PORT });

document.addEventListener("DOMContentLoaded", async () => {
  const ui = new UIManager();
  const settings = await SettingsService.getSettings();
  ui.updateUI(settings);
});
