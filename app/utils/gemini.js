import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const expoundVerse = async ({ prompt }) => {
  try {
    const result = await model.generateContentStream(prompt);
    return result.stream;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw error;
  }
};
