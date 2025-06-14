import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
  throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
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
});

export const expoundVerse = async ({ conversation }) => {
  try {
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
    throw error;
  }
};
