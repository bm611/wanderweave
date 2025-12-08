import Together from "together-ai";

export const generateLocationImage = async (location: string): Promise<string | undefined> => {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    console.warn("Together API Key is missing.");
    return undefined;
  }

  const together = new Together({ apiKey });

  try {
    const prompt = `CITY=${location}\n\nPresent a clear, 45° top-down isometric miniature 3D cartoon scene of ${location}, featuring its most iconic landmarks and architectural elements. Use soft, refined textures with realistic PBR materials and gentle, lifelike lighting and shadows. Integrate the current weather conditions directly into the city environment to create an immersive atmospheric mood.\n\nUse a clean, minimalistic composition with a soft, solid-colored background.\n\nAt the top-center, place the title “${location}” in large bold text.\n\nAll text must be centered with consistent spacing, and may subtly overlap the tops of the buildings.\n\nSquare 1080x1080 dimension.`;

    const response = await together.images.generate({
      model: "google/flash-image-2.5",
      prompt: prompt,
      disable_safety_checker: true,
      // @ts-ignore - response_format is valid but might not be in the types yet or requires specific casting
      response_format: "b64_json" 
    });

    const b64Json = response.data[0].b64_json;
    if (b64Json) {
      return `data:image/jpeg;base64,${b64Json}`;
    } else if (response.data[0].url) {
      return response.data[0].url;
    }
    
    return undefined;
  } catch (error) {
    console.error("Together AI image generation failed:", error);
    return undefined;
  }
};
