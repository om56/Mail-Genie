const toggleSwitch = document.getElementById("toggleSwitch");
const statusBadge = document.getElementById("statusBadge");
const toneButtons = document.querySelectorAll(".tone-btn");
const toneSection = document.getElementById("toneSection");

// Load saved settings on popup open
chrome.storage.sync.get(["enabled", "tone"], (data) => {
  const isEnabled = data.enabled !== false; // default ON
  const savedTone = data.tone || "Professional";

  toggleSwitch.checked = isEnabled;
  updateStatusBadge(isEnabled);
  updateToneButtons(savedTone);
  toneSection.style.opacity = isEnabled ? "1" : "0.4";
  toneSection.style.pointerEvents = isEnabled ? "all" : "none";
});

// Toggle ON/OFF
toggleSwitch.addEventListener("change", () => {
  const isEnabled = toggleSwitch.checked;
  chrome.storage.sync.set({ enabled: isEnabled });
  updateStatusBadge(isEnabled);
  toneSection.style.opacity = isEnabled ? "1" : "0.4";
  toneSection.style.pointerEvents = isEnabled ? "all" : "none";

  // Notify content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleExtension",
        enabled: isEnabled,
      });
    }
  });
});

// Tone selection
toneButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selectedTone = btn.dataset.tone;
    chrome.storage.sync.set({ tone: selectedTone });
    updateToneButtons(selectedTone);

    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateTone",
          tone: selectedTone,
        });
      }
    });
  });
});

function updateStatusBadge(isEnabled) {
  if (isEnabled) {
    statusBadge.textContent = "● Active";
    statusBadge.className = "status-badge status-on";
  } else {
    statusBadge.textContent = "● Inactive";
    statusBadge.className = "status-badge status-off";
  }
}

function updateToneButtons(activeTone) {
  toneButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tone === activeTone);
  });
}
