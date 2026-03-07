let pendingQuery = null;

// Handle omnibox input
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  chrome.storage.sync.get({ mode: 'new', conversationUrl: '' }, (data) => {
    let url;
    if (data.mode === 'pinned' && data.conversationUrl) {
      url = data.conversationUrl.split('?')[0];
    } else {
      url = 'https://claude.ai/new';
    }

    pendingQuery = text;

    switch (disposition) {
      case "currentTab":
        chrome.tabs.update({ url });
        break;
      case "newForegroundTab":
        chrome.tabs.create({ url });
        break;
      case "newBackgroundTab":
        chrome.tabs.create({ url, active: false });
        break;
    }
  });
});

// Respond to content script requesting the pending query
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getPendingQuery') {
    sendResponse({ query: pendingQuery });
    pendingQuery = null;
  }
});

// Provide suggestions as user types (optional enhancement)
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (text.length > 0) {
    suggest([
      {
        content: text,
        description: `Ask Claude: "${text}"`
      }
    ]);
  }
});

// Set default suggestion
chrome.omnibox.setDefaultSuggestion({
  description: "Ask Claude: %s"
});
