import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Initialize the model
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: "You are a helpful digital assistant. Keep responses concise and friendly."
});

// Store chat history
let chatHistory = [];

export async function getChatResponse(userMessage) {
  try {
    // Add user message to history
    chatHistory.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // Add assistant response to history
    chatHistory.push({
      role: "model",
      parts: [{ text: text }],
    });

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

// Reset chat history (useful for new conversations)
export function resetChat() {
  chatHistory = [];
}
