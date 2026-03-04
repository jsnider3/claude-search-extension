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

// Save settings
saveBtn.addEventListener('click', () => {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const conversationUrl = urlInput.value.trim();

  chrome.storage.sync.set({ mode, conversationUrl }, () => {
    status.classList.add('show');
    setTimeout(() => status.classList.remove('show'), 1500);
  });
});
