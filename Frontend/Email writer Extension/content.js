console.log("Working...");

let isEnabled = true;
let currentTone = "Professional";

// Load settings on start
chrome.storage.sync.get(["enabled", "tone"], (data) => {
  isEnabled = data.enabled !== false;
  currentTone = data.tone || "Professional";
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "toggleExtension") {
    isEnabled = message.enabled;
    if (!isEnabled) {
      // Remove button if disabled
      const existingButton = document.querySelector(".ai-reply-button");
      if (existingButton) existingButton.remove();
    } else {
      // Re-inject if enabled
      setTimeout(injectButton, 300);
    }
  }
  if (message.action === "updateTone") {
    currentTone = message.tone;
    // Update button tooltip
    const btn = document.querySelector(".ai-reply-button");
    if (btn) btn.setAttribute("data-tooltip", `Generate ${currentTone} Reply`);
  }
});

function getEmailContent() {
  const selectors = [
    ".h7",
    ".a3s.aiL",
    ".gmail_quote",
    '[role="presentation"]',
  ];
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) {
      return content.innerText.trim();
    }
  }
  return "";
}

function findComposeToolbar() {
  const selectors = [".btC", ".aDh", '[role="toolbar"]', ".gU.Up"];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
  }
  return null;
}

function createAIButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3";
  button.style.marginRight = "8px";
  button.innerHTML = "✉️ AI Reply";
  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", `Generate ${currentTone} Reply`);
  return button;
}

function injectButton() {
  if (!isEnabled) return;

  const existingButton = document.querySelector(".ai-reply-button");
  if (existingButton) {
    existingButton.remove();
  }

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("Toolbar not found");
    return;
  }

  console.log("Toolbar found");
  const button = createAIButton();
  button.classList.add("ai-reply-button");

 button.addEventListener("click", async () => {
    // ✅ Extension context check
    if (!chrome.runtime?.id) {
      button.innerHTML = "🔄 Reload Page";
      button.onclick = () => location.reload();
      return;
    }
    try {
    button.innerHTML = "⏳ Generating...";
    button.disabled = true;        
    const emailContent = getEmailContent();  

    // Get latest tone from storage
    const data = await chrome.storage.sync.get(["tone"]);
      const tone = data.tone || "Professional";

      const response = await fetch("http://localhost:8080/api/email/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailContent: emailContent,
          tone: tone,
        }),
      });

      if (!response.ok) {
        throw new Error("API Request Failed");
      }

      const generatedReply = await response.text();
      const composeBox = document.querySelector(
        '[role="textbox"][contenteditable="true"]'
      );
      if (composeBox) {
        composeBox.focus();
        document.execCommand("insertText", false, generatedReply);
      }
    } catch (e) {
      console.error("Error generating reply:", e);
      button.innerHTML = "❌ Error - Try Again";
    } finally {
      button.innerHTML = "✉️ AI Reply";
      button.disabled = false;
    }
  });

  toolbar.insertBefore(button, toolbar.firstChild);
}

// 1. MutationObserver - detects compose window opening
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.aDh, .btC, [role="dialog"]') ||
          node.querySelector('.aDh, .btC, [role="dialog"]'))
    );
    if (hasComposeElements) {
      console.log("Compose window detected...");
      setTimeout(injectButton, 500);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// 2. Fallback interval
setInterval(() => {
  if (!isEnabled) return;
  const toolbar = findComposeToolbar();
  const existingButton = document.querySelector(".ai-reply-button");
  if (toolbar && !existingButton) {
    console.log("Fallback: Injecting button...");
    injectButton();
  }
}, 2000);

// 3. URL change detector
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log("URL changed, re-checking...");
    setTimeout(injectButton, 1000);
  }
}).observe(document.body, { childList: true, subtree: true });
