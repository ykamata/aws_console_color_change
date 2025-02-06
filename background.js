const CONSTANTS = {
  MESSAGES: {
    PING: "AC3__ping",
    PONG: "AC3__pong",
    UPDATE_COLOR: "AC3__updateColor",
    POPUP_PORT: "AC3__popup",
  },
  URLS: {
    AWS_CONSOLE: "console.aws.amazon.com",
  },
};

// Tab manager class to handle tab-related operations
class TabManager {
  static async queryAwsConsoleTabs() {
    return chrome.tabs.query({
      url: "*://*.console.aws.amazon.com/*",
      active: true,
      currentWindow: true,
    });
  }

  static async sendMessageToTab(tabId, message) {
    return chrome.tabs.sendMessage(tabId, message);
  }

  static async injectContentScript(tabId) {
    return chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
  }
}

// Message handler class to manage communication
class MessageHandler {
  static async pingTab(tab) {
    try {
      const response = await TabManager.sendMessageToTab(tab.id, {
        action: CONSTANTS.MESSAGES.PING,
      });
      return response?.message === CONSTANTS.MESSAGES.PONG;
    } catch (error) {
      console.log("Tab does not have the script yet.");
      return false;
    }
  }

  static async updateTabColor(tab) {
    try {
      await TabManager.sendMessageToTab(tab.id, {
        action: CONSTANTS.MESSAGES.UPDATE_COLOR,
      });
    } catch (error) {
      console.log("Error: sendMessage", error);
    }
  }

  static async handleTabUpdate(tab) {
    try {
      const isPongReceived = await this.pingTab(tab);

      if (isPongReceived) {
        await this.updateTabColor(tab);
        return;
      }

      // If ping failed, inject content script and try updating color
      try {
        await TabManager.injectContentScript(tab.id);
        await this.updateTabColor(tab);
      } catch (error) {
        console.log("Error: executeScript", error);
      }
    } catch (error) {
      console.log("Error in handleTabUpdate:", error);
    }
  }
}

// Event listeners
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    if (tab.url?.includes(CONSTANTS.URLS.AWS_CONSOLE)) {
      await MessageHandler.handleTabUpdate(tab);
    }
  });
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === CONSTANTS.MESSAGES.POPUP_PORT) {
    port.onDisconnect.addListener(async () => {
      console.log("Popup window closed");
      try {
        const tabs = await TabManager.queryAwsConsoleTabs();
        for (const tab of tabs) {
          await MessageHandler.handleTabUpdate(tab);
        }
      } catch (error) {
        console.log("Error: query", error);
      }
    });
  }
});
