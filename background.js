chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    if (tab.url?.includes("console.aws.amazon.com")) {
      await sendMessageWithCheck(tab);
    }
  });
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "AC3__popup") {
    port.onDisconnect.addListener(async () => {
      console.log("popup.htmlが閉じられました");
      // 必要に応じて、ここで追加の処理を行います
      try {
        const tabs = await chrome.tabs.query({
          url: "*://*.console.aws.amazon.com/*",
          active: true,
          currentWindow: true,
        });
        tabs.forEach(async (tab) => {
          console.log("Query>", tab.title);
          await sendMessageWithCheck(tab);
        });
      } catch (e) {
        console.log("Error: query", e);
      }
    });
  }
});

const sendMessageWithCheck = async (tab) => {
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "AC3__ping",
    });
    if (response.message === "AC3__pong") {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "AC3__updateColor",
        });
      } catch (e) {
        console.log("Error: sendMessage", e);
      }
    }
  } catch (e) {
    console.log("tab did not return pong");
    try {
      const injectionResult = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "AC3__updateColor",
        });
      } catch (e) {
        console.log("Error: sendMessage after inject", e);
      }
    } catch (e) {
      console.log("Error: executeScript", e);
    }
  }
};
