chrome.storage.sync.get("settings", ({ settings }) => {
  if (!settings) return;
  const accountElement = document.querySelector("span.globalNav-2252");
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
        const header = document.querySelector("nav.globalNav-223");
        const footer = document.querySelector("#console-nav-footer-inner");
        if (header) header.style.backgroundColor = color;
        if (footer) footer.style.backgroundColor = color;
      }
    }
  }
});
