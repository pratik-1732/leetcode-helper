let cachedContent = "";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getProblem") {
    if (cachedContent) {
      console.log("📩 Sending cached content");
      sendResponse(cachedContent);
    } else {
      const currentContent = extractProblemContent();
      if (currentContent) {
        cachedContent = currentContent;
        sendResponse(cachedContent);
      } else {
        sendResponse("Problem content is still loading...");
      }
    }
  }
  return true;
});

// extracting problem statement
function extractProblemContent() {
  const title =
    document.querySelector("div[class*='title']")?.innerText ||
    document.querySelector("h1")?.innerText ||
    document.title;

  const content =
    document.querySelector("div[data-track-load='description_content']")
      ?.innerText ||
    document.querySelector("div[class*='content']")?.innerText ||
    document.querySelector("div[class*='description']")?.innerText;

  return content ? `${title}\n${content}` : null;
}

// waiting for content
function waitForContent() {
  const interval = setInterval(() => {
    const content = extractProblemContent();
    if (content && !cachedContent) {
      clearInterval(interval);
      cachedContent = content;
      console.log("📘 Title + Content captured");
    }
  }, 500);

  setTimeout(() => clearInterval(interval), 30000);
}

waitForContent();
