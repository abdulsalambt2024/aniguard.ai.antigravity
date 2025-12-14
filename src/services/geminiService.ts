import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const sendMessageToGemini = async (message: string, history: { role: string; parts: string }[] = []) => {
    if (!API_KEY) {
        console.warn("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
        return "I am ready to help! However, my brain (API Key) is missing. Please add VITE_GEMINI_API_KEY to your .env file.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Convert history to Gemini format if needed (simple approximation)
        // The SDK expects { role: 'user' | 'model', parts: [{ text: string }] }
        // Our app passes role: 'user' | 'assistant'
        const validHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.parts }]
        }));

        const chat = model.startChat({
            history: validHistory,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        return "I'm having trouble connecting to Gemini right now. Please try again later.";
    }
};
