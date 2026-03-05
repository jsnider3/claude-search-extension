const modeRadios = document.querySelectorAll('input[name="mode"]');
const urlInput = document.getElementById('conversationUrl');
const saveBtn = document.getElementById('save');
const status = document.getElementById('status');

// Toggle URL input based on mode
modeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    urlInput.disabled = radio.value !== 'pinned' || !radio.checked;
  });
});

// Load saved settings
chrome.storage.sync.get({ mode: 'new', conversationUrl: '' }, (data) => {
  document.querySelector(`input[name="mode"][value="${data.mode}"]`).checked = true;
  urlInput.value = data.conversationUrl;
  urlInput.disabled = data.mode !== 'pinned';
});

function isValidClaudeUrl(url) {
  return /^https:\/\/claude\.ai\/chat\/[a-zA-Z0-9-]+$/.test(url);
}

// Save settings
saveBtn.addEventListener('click', () => {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const conversationUrl = urlInput.value.trim();

  if (mode === 'pinned' && !isValidClaudeUrl(conversationUrl)) {
    status.textContent = 'Invalid URL — must be https://claude.ai/chat/...';
    status.style.color = '#dc2626';
    status.classList.add('show');
    setTimeout(() => status.classList.remove('show'), 3000);
    return;
  }

  chrome.storage.sync.set({ mode, conversationUrl }, () => {
    status.textContent = 'Saved!';
    status.style.color = '#16a34a';
    status.classList.add('show');
    setTimeout(() => status.classList.remove('show'), 1500);
  });
});
