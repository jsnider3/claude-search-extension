# Claude Search Extension

Use Claude.ai as your default search engine in Chrome.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `claude-search-extension` folder

## Usage

1. Type `cl` in the Chrome address bar
2. Press `Tab` or `Space` (you'll see "Search Claude:")
3. Type your query and press `Enter`

Example: `cl why is the sky blue`

This opens a new Claude.ai conversation with your query automatically submitted.

## Settings

Right-click the extension icon and select **Options**, or go to `chrome://extensions` and click **Details > Extension options**.

- **New conversation / Pinned conversation** — choose whether each query opens a new chat or goes to a specific conversation
- **Auto-submit query** — when enabled (default), the query is sent automatically; when disabled, it fills the input but waits for you to review

## Troubleshooting

**Query doesn't appear in Claude:**
- Make sure you're logged into claude.ai
- The page may have updated its structure; check the browser console for errors

**Extension not working:**
- Verify the extension is enabled in `chrome://extensions/`
- Try reloading the extension

## How It Works

1. The extension registers `cl` as an omnibox keyword
2. When you enter a query, it opens `claude.ai/new` (or a pinned conversation) with a special URL parameter
3. A content script detects that parameter and injects your text into Claude's input
4. If auto-submit is enabled, it clicks the send button

## Notes

- You must be logged into Claude.ai for this to work
- The extension doesn't collect or transmit any data
- Your queries go directly to Claude.ai
