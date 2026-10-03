
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION, getLanguageInstruction } from "../constants";
import { HealthAnalysisResult, HoldSellAnalysis, ProfitReport, AppLanguage, DiseaseAnalysisResult, MarketAdvisoryResult, VetClinic } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generate high-quality Speech from Text using Gemini TTS
 */
export async function generateSpeech(text: string, language: AppLanguage): Promise<Uint8Array | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langPrompt = getLanguageInstruction(language);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this naturally in a helpful tone: ${text}. ${langPrompt}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    // Decode base64 to Uint8Array (Raw PCM)
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    return null;
  }
}

/**
 * General Chat with optional Thinking Mode for complex agricultural reasoning
 */
export async function getChatResponse(
  prompt: string, 
  context: string, 
  language: AppLanguage, 
  isComplex: boolean = false
): Promise<string> {
  const ai = getClient();
  const model = isComplex ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  const langPrompt = getLanguageInstruction(language);
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: `User Context: ${context}\n${langPrompt}\nUser Question: ${prompt}` }]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      ...(isComplex ? { thinkingConfig: { thinkingBudget: 32768 } } : {})
    },
  });

  return response.text || "Connection failed.";
}

/**
 * Analyze uploaded video for key agricultural information
 */
export async function analyzeVideo(base64Video: string, mimeType: string, prompt: string, language: AppLanguage): Promise<string> {
  const ai = getClient();
  const langPrompt = getLanguageInstruction(language);
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Video, mimeType } },
        { text: `${prompt} ${langPrompt}` }
      ]
    },
    config: { systemInstruction: SYSTEM_INSTRUCTION }
  });
  return response.text || "Could not analyze video.";
}

/**
 * Animate an image into a video using Veo
 */
export async function animateImageToVideo(base64Image: string, mimeType: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: {
      imageBytes: base64Image,
      mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
}

export async function scanAnimalHealth(base64Image: string, symptoms: string, language: AppLanguage): Promise<HealthAnalysisResult> {
  const ai = getClient();
  const model = 'gemini-3-flash-preview';
  const langPrompt = getLanguageInstruction(language);
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: `Analyze this animal health scan. User noted symptoms: ${symptoms}. 
          ${langPrompt}
          Return a JSON:
          {
            "conditionName": "string",
            "confidence": "string",
            "severity": "MILD | URGENT | EMERGENCY",
            "description": "string",
            "treatmentPlan": {
              "title": "string",
              "actions": ["string"],
              "immediateSteps": ["string"],
              "advice": "string"
            }
          }`
        }
      ],
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || '{}');
}

/**
 * Analyze uploaded plant specimen photo for diseases and provide organic treatment
 */
export async function analyzeCropDisease(base64Image: string, region: string, language: AppLanguage): Promise<DiseaseAnalysisResult> {
  const ai = getClient();
  const model = 'gemini-3-flash-preview';
  const langPrompt = getLanguageInstruction(language);

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: `Analyze this plant specimen from ${region}. Identify any diseases. 
          ${langPrompt}
          Return a JSON matching the DiseaseAnalysisResult interface:
          {
            "diseaseName": "string",
            "confidence": "string",
            "description": "string",
            "organicTreatment": {
              "title": "string",
              "materials": ["string"],
              "steps": ["string"],
              "preparationTime": "string",
              "applicationMethod": "string"
            },
            "costComparison": {
              "chemicalEstimate": "string",
              "organicEstimate": "string",
              "savings": "string"
            }
          }`
        }
      ],
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || '{}');
}

export async function findNearbyVets(lat: number, lng: number, language: AppLanguage): Promise<{ text: string, clinics: VetClinic[] }> {
  const ai = getClient();
  const model = 'gemini-2.5-flash';
  const langPrompt = getLanguageInstruction(language);

  const response = await ai.models.generateContent({
    model,
    contents: `Find 5 nearby veterinary clinics and government animal hospitals near latitude ${lat}, longitude ${lng}. ${langPrompt}`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    }
  });

  const clinics: VetClinic[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  chunks.forEach((chunk: any) => {
    if (chunk.maps) {
      clinics.push({
        name: chunk.maps.title,
        uri: chunk.maps.uri,
        address: chunk.maps.placeAnswerSources?.[0]?.formattedAddress
      });
    }
  });

  return {
    text: response.text || "Here are some nearby clinics:",
    clinics
  };
}

export async function getMarketAdvisory(cropName: string, region: string, language: AppLanguage): Promise<MarketAdvisoryResult> {
  const ai = getClient();
  const model = 'gemini-3-flash-preview';
  const langPrompt = getLanguageInstruction(language);

  const response = await ai.models.generateContent({
    model,
    contents: `Provide a real-time market advisory for ${cropName} in ${region} using Google Search for latest news and prices. ${langPrompt}. Return as JSON with web sources.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    }
  });

  const data = JSON.parse(response.text || '{}');
  data.sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  return data;
}

export async function analyzeHoldSell(animal: string, price: string, health: string, framework: string, language: AppLanguage): Promise<HoldSellAnalysis> {
  const ai = getClient();
  const model = 'gemini-3-flash-preview';
  const langPrompt = getLanguageInstruction(language);

  const response = await ai.models.generateContent({
    model,
    contents: `Evaluate the decision to HOLD or SELL: Animal: ${animal}, Price: ${price}, Health: ${health}. Using ${framework} framework. ${langPrompt}.
      Return a JSON:
      {
        "decision": "HOLD | SELL",
        "estimatedPriceNow": "string",
        "projectedPriceFuture": "string",
        "biologicalRiskScore": number,
        "feedCostImpact": "string",
        "riskFactors": ["string"],
        "reasoning": "string"
      }`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function getProfitReport(income: number, feed: number, vet: number, labor: number, language: AppLanguage): Promise<ProfitReport> {
  const ai = getClient();
  const model = 'gemini-3-flash-preview';
  const langPrompt = getLanguageInstruction(language);

  const response = await ai.models.generateContent({
    model,
    contents: `Generate a profitability report for: Income: ${income}, Feed: ${feed}, Vet: ${vet}, Labor: ${labor}. ${langPrompt}.
      Return a JSON:
      {
        "netProfit": "string",
        "expenseBreakdown": {
          "feed": "string",
          "vet": "string",
          "labor": "string",
          "other": "string"
        },
        "efficiencyScore": number,
        "recommendations": ["string"]
      }`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateFarmerStories(region: string, language: AppLanguage): Promise<any[]> {
  const ai = getClient();
  const model = 'gemini-3-flash-preview';
  const langPrompt = getLanguageInstruction(language);

  const response = await ai.models.generateContent({
    model,
    contents: `Generate 3 inspirational farmer success stories in ${region}. ${langPrompt}. 
      Return a JSON array of objects with keys: farmer, location, crop, disease, story, shortSummary.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || '[]');
}

export async function generateInstructionalVideo(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Professional agricultural demonstration: ${prompt}`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
}
