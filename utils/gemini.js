import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if API key is available
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("EXPO_PUBLIC_GEMINI_API_KEY is not set. Gemini features will be disabled.");
}

// Only initialize if API key is available
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_NONE",
    },
  ],
}) : null;

export const expoundVerse = async ({ conversation }) => {
  try {
    // Check if API is available
    if (!apiKey || !model) {
      throw new Error("Gemini API is not configured. Please check your API key.");
    }

    const history = conversation
      .slice(0, -1)
      .filter((message) => message.content)
      .map((message) => ({
        role: message.role,
        parts: [{ text: message.content }],
      }));

    const chat = model.startChat({ history });
    const lastMessage = conversation[conversation.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();
    return { text };
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    // Return a user-friendly error message instead of throwing
    return { 
      text: "Sorry, I'm unable to generate a response right now. Please check your internet connection and try again." 
    };
  }
};
