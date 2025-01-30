chrome.storage.sync.get("settings", ({ settings }) => {
  if (!settings) return;

  const applyColor = () => {
    const accountElement = document.querySelector(
      "[data-testid='awsc-account-info-tile']"
    );
    if (accountElement) {
      const accountText = accountElement.textContent.trim();
      let accountId;

      // Match Alias and ID format: "<Alias>(<AccountID in hyphenated format>)"
      let match = accountText.match(/\((\d{4}-\d{4}-\d{4})\)/);
      if (match) {
        accountId = match[1].replace(/-/g, ""); // Remove hyphens
      } else {
        // Match ID only format: "アカウントID: <AccountID in hyphenated format>"
        match = accountText.match(/アカウント\s*ID:\s*(\d{4}-\d{4}-\d{4})/);
        if (match) {
          accountId = match[1].replace(/-/g, ""); // Remove hyphens
        }
      }

      if (accountId) {
        const color = settings[accountId];
        if (color) {
          const header = document.querySelector("#awsc-top-level-nav");
          const footer = document.querySelector("#console-nav-footer-inner");
          if (header) header.style.backgroundColor = color;
          if (footer) footer.style.backgroundColor = color;
        }
      }
    }
  };

  // Use MutationObserver to detect when the element appears
  const observer = new MutationObserver(() => {
    if (document.querySelector("[data-testid='awsc-account-info-tile']")) {
      applyColor();
      observer.disconnect(); // Stop observing once the element is found
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
