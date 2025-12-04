import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StoryboardData, TripMemoryInput, TripDetails } from "../types";

// Helper to convert File to base64
const fileToPart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Internal function for text generation
const generateStoryText = async (ai: GoogleGenAI, memories: TripMemoryInput[], details: TripDetails): Promise<StoryboardData> => {
  // Define the schema for the output
  const storySchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A creative and catchy title for the trip story." },
      summary: { type: Type.STRING, description: "A warm, evocative summary paragraph of the entire journey." },
      themeColor: { type: Type.STRING, description: "A dominant hex color code representing the vibe of the trip (e.g., #FF5733)." },
      segments: {
        type: Type.ARRAY,
        description: "An ordered list of story segments corresponding 1-to-1 with the provided images.",
        items: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING, description: "A short, punchy caption for the photo." },
            narrative: { type: Type.STRING, description: "A 2-3 sentence storytelling narrative connecting this moment to the journey." },
            moodColor: { type: Type.STRING, description: "A hex color code extracted from the image or mood." },
            location: { type: Type.STRING, description: "The refined location name." },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 keywords describing the vibe." },
            estimatedTimeOfDay: { type: Type.STRING, description: "e.g., Morning, Sunset, Late Night" },
          },
          required: ["caption", "narrative", "moodColor", "location", "tags"],
        },
      },
    },
    required: ["title", "summary", "segments", "themeColor"],
  };

  const parts = [];
  
  // 1. Add instructions with Trip Details
  let promptText = `I am providing ${memories.length} images from a trip. 
  
  TRIP OVERVIEW:
  - Destination: ${details.destination}
  - Time Period: ${details.dates}
  - Travelers/Context: ${details.companions}

  For each image, I will provide the user's location notes below. 
  Your task is to create a cohesive travel storyboard JSON. 
  Use the Trip Overview to write a specific and engaging Title and Summary.
  
  Strictly follow the order of images. The first segment in the JSON must correspond to the first image provided, and so on.
  
  User's Notes per Image Index (0-based):
  `;

  memories.forEach((mem, index) => {
    promptText += `Image ${index}: Location Note: "${mem.location}", Memory Note: "${mem.notes}"\n`;
  });

  parts.push({ text: promptText });

  // 2. Add images
  for (const mem of memories) {
    const base64Data = await fileToPart(mem.file);
    parts.push({
      inlineData: {
        mimeType: mem.file.type,
        data: base64Data,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      role: "user",
      parts: parts
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: storySchema,
      systemInstruction: "You are a world-class travel writer and photographer editor. You create compelling, emotional, and visually aware travel stories.",
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No data returned from Gemini");

  const data = JSON.parse(jsonText) as StoryboardData;

  // Post-process to re-attach IDs (since Gemini doesn't know our internal IDs)
  if (data.segments && data.segments.length === memories.length) {
    data.segments = data.segments.map((seg, i) => ({
      ...seg,
      memoryId: memories[i].id
    }));
  } else {
      console.warn("Segment count mismatch, attempting best fit mapping.");
      data.segments = data.segments.map((seg, i) => ({
          ...seg,
          memoryId: memories[i] ? memories[i].id : 'unknown'
      })).slice(0, memories.length);
  }

  return data;
};

// Internal function for weather image generation
const generateWeatherCard = async (ai: GoogleGenAI, details: TripDetails): Promise<string | undefined> => {
  try {
    const prompt = `Present a clear, 45° top-down isometric miniature 3D cartoon scene of ${details.destination}, featuring its most iconic landmarks and architectural elements. Use soft, refined textures with realistic PBR materials and gentle, lifelike lighting and shadows. Integrate the typical weather conditions for ${details.dates} directly into the city environment to create an immersive atmospheric mood.
Use a clean, minimalistic composition with a soft, solid-colored background.

At the top-center, render the title "${details.destination}" in large bold text, a prominent weather icon beneath it, then the date "${details.dates}" (small text) and the estimated typical temperature for this time (medium text).
All text must be centered with consistent spacing, and may subtly overlap the tops of the buildings.
Square 1080x1080 dimension.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  } catch (error) {
    console.warn("Weather image generation failed:", error);
    // Return undefined so the app continues without the image
    return undefined;
  }
};

export const generateStoryboard = async (memories: TripMemoryInput[], details: TripDetails): Promise<StoryboardData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Run text and image generation in parallel
  const [storyData, weatherImageUrl] = await Promise.all([
    generateStoryText(ai, memories, details),
    generateWeatherCard(ai, details)
  ]);

  return {
    ...storyData,
    weatherImageUrl
  };
};