chrome.runtime.onInstalled.addListener(() => {
  console.log("AWS Console Color Changer installed.");
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url && tab.url.includes("aws.amazon.com")) {
    chrome.scripting.executeScript({
      target: { tabId: activeInfo.tabId },
      files: ["content.js"],
    });
  }
});
