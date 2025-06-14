import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const expoundVerse = async ({ conversation }) => {
  try {
    const chat = model.startChat({
      history: conversation.slice(0, -1).map((message) => ({
        role: message.role,
        parts: [{ text: message.content }],
      })),
    });
    const lastMessage = conversation[conversation.length - 1];
    const result = await chat.sendMessageStream(lastMessage.content);
    return result.stream;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw error;
  }
};
