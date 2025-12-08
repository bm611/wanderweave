export const generateLocationImage = async (location: string): Promise<string | undefined> => {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    console.warn("Together API Key is missing.");
    return undefined;
  }

  try {
    const prompt = `CITY=${location}\n\nPresent a clear, 45° top-down isometric miniature 3D cartoon scene of ${location}, featuring its most iconic landmarks and architectural elements. Use soft, refined textures with realistic PBR materials and gentle, lifelike lighting and shadows. Integrate the current weather conditions directly into the city environment to create an immersive atmospheric mood.\n\nUse a clean, minimalistic composition with a soft, solid-colored background.\n\nAt the top-center, place the title “${location}” in large bold text.\n\nAll text must be centered with consistent spacing, and may subtly overlap the tops of the buildings.\n\nSquare 1080x1080 dimension.`;

    const response = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/flash-image-2.5",
        prompt: prompt,
        disable_safety_checker: true,
        response_format: "b64_json",
        n: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Together AI API error:", response.status, errorData);
      return undefined;
    }

    const data = await response.json();
    
    // Check for b64_json first
    if (data.data && data.data[0] && data.data[0].b64_json) {
       return `data:image/jpeg;base64,${data.data[0].b64_json}`;
    }
    
    // Check for url as fallback
    if (data.data && data.data[0] && data.data[0].url) {
      return data.data[0].url;
    }

    return undefined;
  } catch (error) {
    console.error("Together AI image generation failed:", error);
    return undefined;
  }
};
