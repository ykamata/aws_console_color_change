const SELECTORS = {
  ACCOUNT_INFO: "[data-testid='awsc-account-info-tile']",
  HEADER: "#awsc-top-level-nav",
  FOOTER: "#console-nav-footer-inner",
};

const applyColor = () => {
  chrome.storage.sync.get("settings", ({ settings }) => {
    if (!settings) return;

    try {
      const accountElement = document.querySelector(SELECTORS.ACCOUNT_INFO);
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
            const header = document.querySelector(SELECTORS.HEADER);
            const footer = document.querySelector(SELECTORS.FOOTER);
            if (header) header.style.backgroundColor = color;
            if (footer) footer.style.backgroundColor = color;
          }
        }
      }
    } catch (error) {
      console.error("Error applying color:", error);
    }
  });
};

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const debouncedApplyColor = debounce(applyColor, 250);

// Use MutationObserver to detect when the element appears
const observer = new MutationObserver(() => {
  if (document.querySelector(SELECTORS.ACCOUNT_INFO)) {
    debouncedApplyColor();
    observer.disconnect(); // Stop observing once the element is found
  }
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "AC3__ping") {
    sendResponse({ message: "AC3__pong" });
  } else if (message.action === "AC3__updateColor") {
    debouncedApplyColor();
  }
});
