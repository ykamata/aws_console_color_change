chrome.storage.sync.get("settings", ({ settings }) => {
  if (!settings) return;
  const accountElement = document.querySelector('[data-testid="aws-account"]');
  if (accountElement) {
    const accountText = accountElement.textContent.trim();
    let accountId;

    // Match Alias and ID format: "<Alias>(<AccountID in hyphenated format>)"
    let match = accountText.match(/\((\d{4}-\d{4}-\d{4})\)/);
    if (match) {
      accountId = match[1].replace(/-/g, ""); // Remove hyphens
    } else {
      // Match ID only format: "アカウントID: <AccountID in hyphenated format>"
      match = accountText.match(/アカウントID:\s*(\d{4}-\d{4}-\d{4})/);
      if (match) {
        accountId = match[1].replace(/-/g, ""); // Remove hyphens
      }
    }

    if (accountId) {
      const color = settings[accountId];
      if (color) {
        const header = document.querySelector("header");
        const footer = document.querySelector("footer");
        if (header) header.style.backgroundColor = color;
        if (footer) footer.style.backgroundColor = color;
      }
    }
  }
});
