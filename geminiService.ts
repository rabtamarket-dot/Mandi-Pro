
import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData, InvoiceItem } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractInvoiceFromImage = async (base64Image: string): Promise<Partial<InvoiceData>> => {
  const systemInstruction = `
    You are an expert Mandi (Grain Market) Billing Specialist.
    Your task is to extract billing details from a Mandi invoice image.
    Specializing in handwritten notes and thermal printer receipts.
    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Extract shop name, address, phone, and all billing info from this Mandi invoice." }
      ]
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          shopName: { type: Type.STRING },
          address: { type: Type.STRING },
          phone: { type: Type.STRING },
          billNumber: { type: Type.STRING },
          partyName: { type: Type.STRING },
          date: { type: Type.STRING },
          trolleyNo: { type: Type.STRING },
          brokerName: { type: Type.STRING },
          ratePerMaund: { type: Type.NUMBER },
          commissionRate: { type: Type.NUMBER },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                katt: { type: Type.NUMBER },
                bharti: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    }
  });

  try {
    const responseText = response.text;
    if (!responseText) return {};
    return JSON.parse(responseText);
  } catch (e) {
    console.error("Failed to parse AI image response", e);
    return {};
  }
};

export const parseVoiceCommand = async (base64Audio: string): Promise<Partial<InvoiceItem>> => {
  const systemInstruction = `
    You are an Urdu voice assistant for a Mandi App. 
    Analyze the audio and extract:
    - quantity (تعداد / تھیلے)
    - weight (وزن / کلو)
    - rate (ریٹ / قیمت)
    - description (نام - default to 'دھان')

    Example input: "پچاس تھیلے ساٹھ کلو وزن ریٹ پینتالیس سو"
    Result: { "quantity": 50, "weight": 60, "rate": 4500, "description": "دھان" }
    
    Return pure JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
        { text: "Extract bill quantities from this audio." }
      ]
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          weight: { type: Type.NUMBER },
          rate: { type: Type.NUMBER }
        }
      }
    }
  });

  try {
    const responseText = response.text;
    return responseText ? JSON.parse(responseText) : {};
  } catch (e) {
    console.error("Voice parsing failed", e);
    return {};
  }
};

