chrome.runtime.connect({ name: "AC3__popup" });

document.addEventListener("DOMContentLoaded", () => {
  const accountInput = document.getElementById("account");
  const colorInput = document.getElementById("color");
  const addButton = document.getElementById("add");
  const colorPreview = document.getElementById("color-preview");
  const colorError = document.getElementById("color-error");
  const recordsContainer = document.getElementById("records");

  function normalizeAccountId(accountId) {
    return accountId.replace(/-/g, ""); // Remove hyphens for storage
  }

  function accountForDisplay(accountId) {
    return accountId.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  function isValidHexColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  function updateUI(settings) {
    recordsContainer.innerHTML = "";
    for (const [account, color] of Object.entries(settings)) {
      const row = document.createElement("div");
      row.classList.add("record-row");
      row.innerHTML = `
        <span class="record-item account-part">${accountForDisplay(
          account
        )}</span>
        <span class="record-item color-display" style="background-color: ${color}; padding: 5px; text-shadow: 1px 1px 1px white, -1px -1px 1px white, 1px -1px 1px white, -1px 1px 1px white;">${color}</span>
        <div class="record-item record-actions">
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
        </div>
      `;
      recordsContainer.appendChild(row);
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
        if (settings[normalizedAccount]) {
          colorError.textContent = "Account already exists.";
          return;
        }
        settings[normalizedAccount] = color;
        chrome.storage.sync.set({ settings });
        updateUI(settings);
      });

      accountInput.value = "";
      colorInput.value = "";
      colorPreview.style.backgroundColor = "";
    }
  });

  recordsContainer.addEventListener("click", function (event) {
    const target = event.target;
    const row = target.closest(".record-row");
    if (target.classList.contains("edit")) {
      const colorSpan = row.querySelector(".color-display");
      colorSpan.style.backgroundColor = "#ffffff";
      const colorValue = colorSpan.textContent.trim();
      colorSpan.innerHTML = `<input type='text' value='${colorValue}' class='x-color-input'> <div class='x-color-preview' style='background-color:${colorValue};'></div>`;
      const colorInput = colorSpan.querySelector(".x-color-input");
      const colorPreview = colorSpan.querySelector(".x-color-preview");

      colorInput.addEventListener("input", () => {
        colorPreview.style.backgroundColor = colorInput.value.trim();
      });

      row.querySelector(".delete").style.display = "none";
      target.textContent = "Update";
      target.classList.remove("edit");
      target.classList.add("update");

      // Cancelリンクを追加
      const cancelLink = document.createElement("span");
      cancelLink.textContent = "Cancel";
      cancelLink.classList.add("cancel-link");
      target.insertAdjacentElement("afterend", cancelLink);

      // Cancelリンクのクリックイベントを設定
      cancelLink.addEventListener("click", () => {
        // 編集をキャンセルして元の表示に戻す
        colorSpan.innerHTML = colorValue;
        colorSpan.style.backgroundColor = colorValue;
        row.querySelector(".delete").style.display = "inline-block";
        target.textContent = "Edit";
        target.classList.remove("update");
        target.classList.add("edit");
        cancelLink.remove();
      });
    } else if (target.classList.contains("update")) {
      const colorInput = row.querySelector(".x-color-input");
      const newColor = colorInput.value.trim();

      const account = row.querySelector(".account-part").textContent.trim();
      const normalizedAccount = normalizeAccountId(account);
      chrome.storage.sync.get("settings", ({ settings }) => {
        if (!settings) settings = {};
        settings[normalizedAccount] = newColor;
        chrome.storage.sync.set({ settings });
      });

      row.querySelector(".color-display").innerHTML = newColor;
      row.querySelector(".color-display").style.backgroundColor = newColor;
      row.querySelector(".delete").style.display = "inline-block";
      target.textContent = "Edit";
      target.classList.remove("update");
      target.classList.add("edit");

      // Cancelリンクを削除
      const cancelLink = row.querySelector(".cancel-link");
      if (cancelLink) cancelLink.remove();
    } else if (target.classList.contains("delete")) {
      const account = row.querySelector(".account-part").textContent.trim();
      const normalizedAccount = normalizeAccountId(account);

      chrome.storage.sync.get("settings", ({ settings }) => {
        if (!settings) settings = {};
        delete settings[normalizedAccount];
        chrome.storage.sync.set({ settings });
      });

      row.remove();
    }
  });
});
