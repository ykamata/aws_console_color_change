document.addEventListener("DOMContentLoaded", () => {
  const accountInput = document.getElementById("account");
  const colorInput = document.getElementById("color");
  const addButton = document.getElementById("add");
  const recordsDiv = document.getElementById("records");
  const colorPreview = document.getElementById("color-preview");
  const colorError = document.getElementById("color-error");

  function normalizeAccountId(accountId) {
    return accountId.replace(/-/g, ""); // Remove hyphens for storage
  }

  function isValidHexColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  function updateUI(settings) {
    recordsDiv.innerHTML = "";
    for (const [account, color] of Object.entries(settings)) {
      const recordDiv = document.createElement("div");
      recordDiv.className = "record";
      recordDiv.textContent = `${account}: ${color}`;
      const deleteButton = document.createElement("span");
      deleteButton.className = "delete";
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => {
        delete settings[normalizeAccountId(account)];
        chrome.storage.sync.set({ settings });
        updateUI(settings);
      };
      recordDiv.appendChild(deleteButton);
      recordsDiv.appendChild(recordDiv);
    }
  }

  chrome.storage.sync.get("settings", ({ settings }) => {
    if (!settings) settings = {};
    updateUI(settings);
  });

  colorInput.addEventListener("input", () => {
    const color = colorInput.value.trim();
    if (isValidHexColor(color)) {
      colorError.textContent = "";
      colorPreview.style.backgroundColor = color;
    } else {
      colorError.textContent = "Invalid color. Please use format #RRGGBB.";
      colorPreview.style.backgroundColor = "";
    }
  });

  addButton.addEventListener("click", () => {
    const account = accountInput.value.trim();
    const color = colorInput.value.trim();
    if (!isValidHexColor(color)) {
      colorError.textContent = "Invalid color. Please use format #RRGGBB.";
      return;
    }
    colorError.textContent = "";

    if (account && color) {
      const normalizedAccount = normalizeAccountId(account);
      chrome.storage.sync.get("settings", ({ settings }) => {
        if (!settings) settings = {};
        settings[normalizedAccount] = color;
        chrome.storage.sync.set({ settings });
        updateUI(settings);
      });
    }
  });
});
