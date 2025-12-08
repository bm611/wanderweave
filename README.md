# WanderWeave

WanderWeave is an AI-powered travel storytelling application that transforms your trip photos into a vivid, cohesive narrative. By analyzing your uploaded images and location notes, it generates a beautifully woven storyboard complete with captions, narratives, mood colors, and a stylized 3D map of your destination.

## Features

- **AI Story Generation**: Uses **Google Gemini 1.5 Flash** to analyze your photos and trip details to create a compelling travel narrative.
- **Visual Storyboard**: Displays your journey as an interactive timeline with mood-aware styling.
- **Generative Location Art**: Leverages **Together AI (Flux Model)** to generate a stunning 3D isometric cartoon view of your trip's destination.
- **Interactive Map**: View your stories on a global map using **Leaflet**.
- **Cloud Storage**: Save your stories securely with **Supabase** authentication and storage, allowing you to revisit your memories anytime.
- **Responsive Design**: A modern, mobile-friendly UI built with React and Tailwind CSS.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **AI Models**:
  - Google Gemini 2.5 Flash (Text & Image Analysis)
  - Together AI - Google Flash Image 2.5 (Image Generation)
- **Backend / Database**: Supabase (Auth, Postgres, Storage)
- **Maps**: Leaflet / React-Leaflet

## Run Locally

**Prerequisites:** Node.js

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/bm611/wanderweave.git
    cd wanderweave
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add the following keys:

    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_google_gemini_api_key
    TOGETHER_API_KEY=your_together_ai_api_key
    ```

4.  **Run the app:**
    ```bash
    npm run dev
    ```

## License

This project is open-source and available under the MIT License.
