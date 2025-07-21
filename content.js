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
