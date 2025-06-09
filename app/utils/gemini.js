import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: Replace with your actual API key
const API_KEY = 'YOUR_API_KEY';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const startChat = () => {
  return model.startChat({
    history: [],
  });
};

export const streamGeminiResponseFromChat = async (chat, prompt) => {
  try {
    const result = await chat.sendMessageStream(prompt);
    return result.stream;
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    throw error;
  }
};

export default () => null; 