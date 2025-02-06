chrome.runtime.connect({ name: "AC3__popup" });

document.addEventListener("DOMContentLoaded", async () => {
  const ui = new UIManager();
  const settings = await SettingsService.getSettings();
  ui.updateUI(settings);
});
