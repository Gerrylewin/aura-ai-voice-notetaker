import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL } from "../constants";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function transcribeAudio(base64Audio, mimeType) {
  try {
    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Audio,
      },
    };
    const textPart = {
      text: "Transcribe this audio recording clearly and accurately. Fix any grammatical errors and format it for readability, but preserve the original meaning."
    };

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts: [audioPart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    throw new Error("Failed to transcribe audio.");
  }
}

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A concise, descriptive title for the note, under 10 words." },
        summary: { type: Type.STRING, description: "A brief summary of the transcript. If the transcript is short, this can be a single sentence." },
        sentiment: { type: Type.STRING, description: "The overall sentiment of the note (e.g., 'Positive', 'Neutral', 'Concern Expressed')." },
        keyTopics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of the main topics or keywords." },
        actionItems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of any action items or tasks mentioned." },
        questions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of any questions asked in the transcript." },
    },
    required: ["title", "summary", "sentiment", "keyTopics", "actionItems", "questions"]
};

export async function analyzeTranscript(transcript) {
    try {
        if (!transcript.trim()) {
            return {
                title: 'Empty Note',
                summary: "This note is empty.",
                sentiment: "Neutral",
                keyTopics: [], actionItems: [], questions: [],
            };
        }
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `Analyze the following transcript and provide a structured analysis. Transcript:\n\n---\n${transcript}\n---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonStr = response.text.trim();
        const cleanedJsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(cleanedJsonStr);
        return parsed;
    } catch (error) {
        console.error("Error in analyzeTranscript:", error);
        return {
            title: transcript.substring(0, 40) + '...' || 'New Note',
            summary: "Could not generate a summary for this note.",
            sentiment: "Unknown",
            keyTopics: [],
            actionItems: [],
            questions: [],
        };
    }
}

export async function continueConversation(history) {
   try {
    const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: formattedHistory,
        config: {
            systemInstruction: `You are Aura, an AI assistant. The user is chatting with you about a voice note they recorded. Your role is to help them understand, refine, or expand upon their note based on the ongoing conversation. Be helpful and concise.`,
        }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error in continueConversation:", error);
    throw new Error("Failed to get AI response.");
  }
}