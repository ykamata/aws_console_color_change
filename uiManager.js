import { REGEX } from "./constants.js";

export default class UIManager {
  constructor() {
    this.elements = {
      accountInput: document.getElementById("account"),
      colorInput: document.getElementById("color"),
      addButton: document.getElementById("add"),
      colorPreview: document.getElementById("color-preview"),
      colorError: document.getElementById("color-error"),
      recordsContainer: document.getElementById("records"),
    };
    this.bindEvents();
  }

  static normalizeAccountId(accountId) {
    return accountId.replace(/-/g, "");
  }

  static accountForDisplay(accountId) {
    return accountId.replace(REGEX.ACCOUNT_FORMAT, "$1-$2-$3");
  }

  static isValidHexColor(color) {
    return REGEX.VALID_COLOR.test(color);
  }

  updateUI = (settings) => {
    this.elements.recordsContainer.innerHTML = "";
    Object.entries(settings).forEach(([account, color]) => {
      this.addRecordRow(account, color);
    });
  };

  addRecordRow = (account, color) => {
    const row = document.createElement("div");
    row.classList.add("record-row");
    row.innerHTML = this.createRowHTML(account, color);
    this.elements.recordsContainer.appendChild(row);
  };

  createRowHTML = (account, color) => {
    return `
        <span class="record-item account-part">${UIManager.accountForDisplay(
          account
        )}</span>
        <span class="record-item color-display" style="background-color: ${color}; padding: 5px; text-shadow: 1px 1px 1px white, -1px -1px 1px white, 1px -1px 1px white, -1px 1px 1px white;">${color}</span>
        <div class="record-item record-actions">
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
        </div>
      `;
  };

  bindEvents = () => {
    this.elements.colorInput.addEventListener("input", this.handleColorInput);
    this.elements.addButton.addEventListener("click", this.handleAdd);
    this.elements.recordsContainer.addEventListener(
      "click",
      this.handleRecordActions
    );
  };

  handleColorInput = () => {
    const color = this.elements.colorInput.value.trim();
    if (UIManager.isValidHexColor(color)) {
      this.elements.colorPreview.style.backgroundColor = color;
      this.elements.colorError.textContent = "";
    } else {
      this.elements.colorPreview.style.backgroundColor = "";
      this.elements.colorError.textContent =
        "Invalid color. Please use format #RRGGBB.";
    }
  };

  handleAdd = () => {
    const account = this.elements.accountInput.value.trim();
    const color = this.elements.colorInput.value.trim();
    if (!UIManager.isValidHexColor(color)) {
      this.elements.colorError.textContent =
        "Invalid color. Please use format #RRGGBB.";
      return;
    }
    this.elements.colorError.textContent = "";

    if (account && color) {
      const normalizedAccount = UIManager.normalizeAccountId(account);
      chrome.storage.sync.get("settings", ({ settings }) => {
        if (!settings) settings = {};
        if (settings[normalizedAccount]) {
          this.elements.colorError.textContent = "Account already exists.";
          return;
        }
        settings[normalizedAccount] = color;
        chrome.storage.sync.set({ settings });
        this.updateUI(settings);
      });

      this.elements.accountInput.value = "";
      this.elements.colorInput.value = "";
      this.elements.colorPreview.style.backgroundColor = "";
    }
  };

  handleRecordActions = (event) => {
    const target = event.target;
    const row = target.closest(".record-row");

    if (target.classList.contains("edit")) {
      this.handleEditMode(target, row);
    } else if (target.classList.contains("update")) {
      this.handleUpdateMode(target, row);
    } else if (target.classList.contains("delete")) {
      this.handleDelete(row);
    }
  };

  handleEditMode = (target, row) => {
    const colorSpan = row.querySelector(".color-display");
    const colorValue = colorSpan.textContent.trim();

    this.setupEditUI(colorSpan, colorValue);
    this.updateButtonsForEdit(target, row);
    this.addCancelButton(target, row, colorSpan, colorValue);
  };

  setupEditUI = (colorSpan, colorValue) => {
    colorSpan.style.backgroundColor = "#ffffff";
    colorSpan.innerHTML = `<input type='text' value='${colorValue}' class='x-color-input'> <div class='x-color-preview' style='background-color:${colorValue};'></div>`;
    const colorInput = colorSpan.querySelector(".x-color-input");
    const colorPreview = colorSpan.querySelector(".x-color-preview");

    colorInput.addEventListener("input", () => {
      colorPreview.style.backgroundColor = colorInput.value.trim();
    });
  };

  updateButtonsForEdit = (target, row) => {
    row.querySelector(".delete").style.display = "none";
    target.textContent = "Update";
    target.classList.remove("edit");
    target.classList.add("update");
  };

  addCancelButton = (target, row, colorSpan, colorValue) => {
    const cancelLink = document.createElement("span");
    cancelLink.textContent = "Cancel";
    cancelLink.classList.add("cancel-link");
    target.insertAdjacentElement("afterend", cancelLink);

    cancelLink.addEventListener("click", () => {
      this.handleCancelEdit(row, colorSpan, colorValue);
    });
  };

  handleCancelEdit = (row, colorSpan, colorValue) => {
    colorSpan.innerHTML = colorValue;
    colorSpan.style.backgroundColor = colorValue;
    row.querySelector(".delete").style.display = "inline-block";
    row.querySelector(".update").textContent = "Edit";
    row.querySelector(".update").classList.add("edit");
    row.querySelector(".update").classList.remove("update");
    row.querySelector(".cancel-link").remove();
  };

  handleUpdateMode = (target, row) => {
    const colorInput = row.querySelector(".x-color-input");
    const newColor = colorInput.value.trim();
    const account = row.querySelector(".account-part").textContent.trim();

    this.updateStorageSettings(account, newColor);
    this.updateRowUI(row, newColor);
    this.resetEditState(target, row);
  };

  updateStorageSettings = async (account, color) => {
    try {
      const normalizedAccount = UIManager.normalizeAccountId(account);
      const { settings = {} } = await chrome.storage.sync.get("settings");

      settings[normalizedAccount] = color;
      await chrome.storage.sync.set({ settings });
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  updateRowUI = (row, newColor) => {
    row.querySelector(".color-display").innerHTML = newColor;
    row.querySelector(".color-display").style.backgroundColor = newColor;
  };

  resetEditState = (target, row) => {
    row.querySelector(".delete").style.display = "inline-block";
    target.textContent = "Edit";
    target.classList.remove("update");
    target.classList.add("edit");
    row.querySelector(".cancel-link").remove();
  };

  handleDelete = (row) => {
    const account = row.querySelector(".account-part").textContent.trim();
    const normalizedAccount = UIManager.normalizeAccountId(account);

    chrome.storage.sync.get("settings", ({ settings }) => {
      if (!settings) settings = {};
      delete settings[normalizedAccount];
      chrome.storage.sync.set({ settings });
    });

    row.remove();
  };
}
