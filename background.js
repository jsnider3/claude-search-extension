// Handle omnibox input
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  chrome.storage.sync.get({ mode: 'new', conversationUrl: '' }, (data) => {
    let url;
    if (data.mode === 'pinned' && data.conversationUrl) {
      const base = data.conversationUrl.split('?')[0];
      url = `${base}?claude_search_query=${encodeURIComponent(text)}`;
    } else {
      url = `https://claude.ai/new?claude_search_query=${encodeURIComponent(text)}`;
    }

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
