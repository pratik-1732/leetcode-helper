const API_KEY = process.env.API_KEY;
const getSteps = document.getElementById("getSteps");
const generateCode = document.getElementById("generateCode");

// calling ai
async function callAI(prompt) {
  try {
    console.log("🔄 Calling Gemini API...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API Response:", data);

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error("⚠️ Unexpected response structure:", data);
      return "No valid response from Gemini.";
    }
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    return `⚠️ Error: ${error.message}`;
  }
}

// get steps
getSteps.addEventListener("click", async () => {
  button.classList.add("loading");
  button.disabled = true;
  output.textContent = "🔄 Analyzing problem...";

  try {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getProblem" },
        async (response) => {
          if (chrome.runtime.lastError) {
            output.textContent =
              "❌ Please refresh the LeetCode page and try again.";
            button.classList.remove("loading");
            button.disabled = false;
            return;
          }

          const prompt = `You are a coding expert. Analyze this LeetCode problem and provide a clear step-by-step solution approach:

            Problem: ${response}

            Please provide:
            1. 🎯 Problem Understanding - What are we trying to solve?
            2. 🔍 Key Insights - What patterns or algorithms apply?
            3. 📝 Algorithm Approach - Step by step method
            4. ⏰ Complexity Analysis - Time and space complexity
            5. 💡 Implementation Tips - Important points to remember 
            Be concise and practical.`;

          const steps = await callAI(prompt);
          output.textContent = steps;
          output.classList.add("has-content", "fade-in");

          button.classList.remove("loading");
          button.disabled = false;
        }
      );
    });
  } catch (error) {
    output.textContent = `❌ Error: ${error.message}`;
    button.classList.remove("loading");
    button.disabled = false;
  }
});

// Generate Code
generateCode.addEventListener("click", async () => {
  const button = document.getElementById("generateCode");
  const output = document.getElementById("codeOutput");
  const lang = document.getElementById("languageSelect").value;
  const stepsContent = document.getElementById("stepsOutput").textContent;

  if (!stepsContent || stepsContent.includes("Output will appear here")) {
    output.textContent =
      "⚠️ Please get the steps first before generating code.";
    return;
  }

  button.classList.add("loading");
  button.disabled = true;
  output.textContent = `🔄 Generating ${lang} code...`;

  try {
    const prompt = `Generate clean, working ${lang} code for this problem analysis: ${stepsContent}
        Requirements:
        - Include proper function signature for LeetCode
        - Add helpful comments explaining key steps
        - Handle edge cases
        - Use efficient algorithms
        - Provide complete, runnable solution
        - Format code properly
        Language: ${lang}`;

    const code = await callAI(prompt);
    output.textContent = code;
    output.classList.add("has-content", "fade-in");
  } catch (error) {
    output.textContent = `❌ Error generating code: ${error.message}`;
  } finally {
    button.classList.remove("loading");
    button.disabled = false;
  }
});
