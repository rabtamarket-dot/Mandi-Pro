
import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData } from "../types";

export const extractInvoiceFromImage = async (base64Image: string): Promise<Partial<InvoiceData>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an expert Mandi (Grain Market) Billing Specialist.
    Your task is to extract billing details from a Mandi invoice image.
    
    SPECIAL BRANDING FIELDS (Look at the top of the page):
    - "Mill Name" / "Shop Name" (Usually biggest text at top).
    - "Address" (Text below name).
    - "Cell" / "Phone" (Phone numbers).

    KEY FIELDS TO LOOK FOR IN URDU:
    - "??? ?????" (Party Name).
    - "?????" (Date): YYYY-MM-DD format.
    - "???? ????" / "????? ????" (Vehicle/Trolley No).
    - "?????" (Broker).
    - "???" (Rate): Price per maund (40kg).
    - "????? ????" / "????": Item descriptions, quantities, and 'katt'.
    - "???" (Weights): Array of numbers.

    Return the data in structured JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
          weights: { type: Type.ARRAY, items: { type: Type.NUMBER } },
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
    const raw = JSON.parse(response.text);
    if (raw.weights && Array.isArray(raw.weights)) {
      raw.weights = raw.weights.map((w: number, i: number) => ({
        id: Math.random().toString(36).substr(2, 9),
        weight: w,
        label: (i + 1).toString()
      }));
    }
    return raw;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {};
  }
};
