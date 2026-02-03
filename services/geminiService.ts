
import { GoogleGenAI, Type, Modality, GenerateContentResponse, VideoGenerationReferenceType } from "@google/genai";

export class GeminiApiError extends Error {
  constructor(public status: number, message: string, public originalError?: any) {
    super(message);
    this.name = 'GeminiApiError';
  }
}

const getAI = () => {
  const userKey = localStorage.getItem('gemini_api_key');
  return new GoogleGenAI({ apiKey: userKey || process.env.API_KEY });
};

const handleApiError = (error: any) => {
  console.error("Gemini API Error details:", error);
  const status = error?.status || error?.error?.code || 500;
  const rawMessage = error?.message || error?.error?.message || "An unknown error occurred";
  
  if (status === 403 || rawMessage.includes("PERMISSION_DENIED")) {
    throw new GeminiApiError(403, "ACCESS_DENIED: High-tier models require a Billing-enabled API key from Google AI Studio.", error);
  }
  throw new GeminiApiError(status, rawMessage, error);
};

export const geminiService = {
  // Thinking Budget is 32768 for Gemini 3 Pro Preview
  async sendMessage(message: string, history: any[] = [], useThinking: boolean = true) {
    try {
      const ai = getAI();
      const config: any = { tools: [{ googleSearch: {} }] };
      if (useThinking) config.thinkingConfig = { thinkingBudget: 32768 };
      
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config,
      });
      return await chat.sendMessage({ message });
    } catch (e) { return handleApiError(e); }
  },

  async generateImage(prompt: string, aspectRatio: string = "1:1", size: string = "1K") {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: size as any } },
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      throw new Error("Generation failed.");
    } catch (e) { return handleApiError(e); }
  },

  async generateStoryboard(scene: string, count: number = 4) {
    try {
      const ai = getAI();
      const promptRes = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Break down this scene into ${count} storyboard frames. For each frame, provide a high-detail visual prompt for an image generator. Format as JSON array of strings. Scene: "${scene}"`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
      const prompts: string[] = JSON.parse(promptRes.text || "[]");
      const images = await Promise.all(prompts.slice(0, count).map(p => this.generateImage(p, "16:9", "1K")));
      return images.map((url, i) => ({ url, prompt: prompts[i] }));
    } catch (e) { return handleApiError(e); }
  },

  async editImage(base64Image: string, prompt: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/png' } },
            { text: prompt },
          ],
        },
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      throw new Error("Edit failed.");
    } catch (e) { return handleApiError(e); }
  },

  async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9', image?: string) {
    try {
      const ai = getAI();
      const config: any = { 
        model: 'veo-3.1-fast-generate-preview', 
        prompt, 
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio } 
      };
      if (image) config.image = { imageBytes: image, mimeType: 'image/png' };
      
      let operation = await ai.models.generateVideos(config);
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const userKey = localStorage.getItem('gemini_api_key');
      const apiKey = userKey || process.env.API_KEY;
      const res = await fetch(`${downloadLink}&key=${apiKey}`);
      const blob = await res.blob();
      return { url: URL.createObjectURL(blob), operation };
    } catch (e) { return handleApiError(e); }
  },

  async visionToCode(base64Image: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/png' } },
            { text: "Analyze this UI design and provide responsive Tailwind CSS code. Use a thinking budget for best results." },
          ],
        },
        config: { thinkingConfig: { thinkingBudget: 32768 } }
      });
      return response.text;
    } catch (e) { return handleApiError(e); }
  },

  async textToScript(text: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create a professional documentary script (JSON array of segments) from: "${text}". Each segment needs: 'voiceover' (narrator text) and 'visual_prompt' (description for video generator).`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (e) { return handleApiError(e); }
  },

  async generateSpeech(text: string, voice: string = 'Kore') {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) { return handleApiError(e); }
  },

  async omniSearch(query: string, files: Array<{data: string, mimeType: string}>) {
    try {
      const ai = getAI();
      const parts = files.map(f => ({ inlineData: { data: f.data, mimeType: f.mimeType } }));
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [...parts, { text: query }] },
        config: { thinkingConfig: { thinkingBudget: 32768 } }
      });
      return response.text;
    } catch (e) { return handleApiError(e); }
  },

  async analyzeMedia(base64Data: string, mimeType: string, prompt: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt },
          ],
        },
        config: { thinkingConfig: { thinkingBudget: 32768 } }
      });
      return response.text;
    } catch (e) { return handleApiError(e); }
  },

  async colorizeImage(base64Image: string) {
    return this.editImage(base64Image, 'Colorize this black and white image naturally. Return the image data.');
  },

  async extendVideo(previousOperation: any, prompt: string) {
    try {
      const ai = getAI();
      const prevVideo = previousOperation.response?.generatedVideos?.[0]?.video;
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt,
        video: prevVideo,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: prevVideo?.aspectRatio || '16:9',
        }
      });
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const userKey = localStorage.getItem('gemini_api_key');
      const apiKey = userKey || process.env.API_KEY;
      const res = await fetch(`${downloadLink}&key=${apiKey}`);
      const blob = await res.blob();
      return { url: URL.createObjectURL(blob), operation };
    } catch (e) { return handleApiError(e); }
  },

  async generateConversation(prompt: string, speaker1: string, speaker2: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Dialogue: ${prompt}. Speakers: ${speaker1} and ${speaker2}.` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                { speaker: speaker1, voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                { speaker: speaker2, voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
              ]
            }
          }
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) { return handleApiError(e); }
  },

  async upscaleImage(base64Image: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/png' } },
            { text: 'Enhance this image to 4K resolution.' },
          ],
        },
        config: { imageConfig: { imageSize: '4K', aspectRatio: '1:1' } }
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      throw new Error("Upscale failed.");
    } catch (e) { return handleApiError(e); }
  },
};
