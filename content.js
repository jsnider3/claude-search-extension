// Content script to inject query into Claude's chat input

(function() {
  const MAX_ATTEMPTS = 50;
  const RETRY_INTERVAL = 200;
  
  function findEditor() {
    const editor = document.querySelector('div.ProseMirror[contenteditable="true"]');
    if (editor && editor.offsetParent !== null) {
      return editor;
    }
    return null;
  }
  
  function findSubmitButton() {
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
      if (ariaLabel.includes('send')) {
        return button;
      }
    }
    return null;
  }
  
  // Simulate typing character by character with proper keyboard events
  function simulateTyping(editor, text) {
    editor.focus();
    
    // Place cursor at end
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    for (const char of text) {
      // keydown
      editor.dispatchEvent(new KeyboardEvent('keydown', {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true
      }));
      
      // beforeinput
      editor.dispatchEvent(new InputEvent('beforeinput', {
        inputType: 'insertText',
        data: char,
        bubbles: true,
        cancelable: true
      }));
      
      // The actual text insertion via execCommand
      document.execCommand('insertText', false, char);
      
      // keyup
      editor.dispatchEvent(new KeyboardEvent('keyup', {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true
      }));
    }
  }
  
  // Try clipboard paste approach
  async function tryClipboardPaste(editor, text) {
    try {
      editor.focus();
      
      // Write to clipboard
      await navigator.clipboard.writeText(text);
      
      // Small delay
      await new Promise(r => setTimeout(r, 50));
      
      // Try execCommand paste
      const success = document.execCommand('paste');
      if (success) {
        await new Promise(r => setTimeout(r, 100));
        if (editor.textContent.trim().length > 0) {
          return true;
        }
      }
    } catch (e) {
      console.log('Clipboard paste failed:', e);
    }
    return false;
  }
  
  // Try insertText execCommand
  function tryExecCommand(editor, text) {
    editor.focus();
    
    // Clear existing content
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Try insertText
    const success = document.execCommand('insertText', false, text);
    return success && editor.textContent.trim().length > 0;
  }
  
  async function fillEditor(editor, text) {
    // Method 1: execCommand insertText (often works with ProseMirror)
    if (tryExecCommand(editor, text)) {
      console.log('Claude Search: Used execCommand');
      return true;
    }
    
    // Method 2: Clipboard paste
    if (await tryClipboardPaste(editor, text)) {
      console.log('Claude Search: Used clipboard paste');
      return true;
    }
    
    // Method 3: Simulate typing (slowest but most reliable)
    console.log('Claude Search: Falling back to simulated typing');
    simulateTyping(editor, text);
    return editor.textContent.trim().length > 0;
  }
  
  async function waitForButtonEnabled(maxWait = 3000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      const button = findSubmitButton();
      if (button && !button.disabled) {
        return button;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    return null;
  }
  
  async function attemptFillAndSubmit(query, autoSubmit) {
    const editor = findEditor();
    if (!editor) return false;

    const filled = await fillEditor(editor, query);
    if (!filled) {
      console.warn('Claude Search: Failed to fill editor');
      return false;
    }

    console.log('Claude Search: Editor filled, waiting for button...');

    if (autoSubmit) {
      const button = await waitForButtonEnabled();
      if (button) {
        console.log('Claude Search: Clicking submit');
        button.click();
      } else {
        console.warn('Claude Search: Submit button never enabled');
      }
    }

    return true;
  }

  // Ask background script for pending query
  chrome.runtime.sendMessage({ type: 'getPendingQuery' }, (response) => {
    const query = response && response.query;
    if (!query) return;

    chrome.storage.sync.get({ autoSubmit: true }, (data) => {
      const autoSubmit = data.autoSubmit;
      let attempts = 0;

      async function tryFill() {
        attempts++;
        console.log(`Claude Search: Attempt ${attempts}`);

        const success = await attemptFillAndSubmit(query, autoSubmit);

        if (!success && attempts < MAX_ATTEMPTS) {
          setTimeout(tryFill, RETRY_INTERVAL);
        }
      }

      function start() {
        setTimeout(tryFill, 800);
      }

      if (document.readyState === 'complete') {
        start();
      } else {
        window.addEventListener('load', start);
      }
    });
  });
})();
