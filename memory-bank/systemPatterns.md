# System Patterns: SociAI Reels

## Overall Architecture

The application, "SociAI Reels," follows a **monolithic architecture with a Next.js frontend and backend** (full-stack Next.js).

```mermaid
graph TD
    User[User] --> Browser[Browser: Next.js Frontend]
    Browser --> NextServer[Next.js Server: API Routes]
    
    NextServer --> DB[Database: PostgreSQL via Drizzle ORM]
    NextServer --> OpenAIService[OpenAI API: GPT, Whisper]
    NextServer --> StockMediaAPIs[Stock Media APIs: Pexels, Pixabay]
    NextServer --> TTSService[TTS API: ElevenLabs, Google, Azure]
    NextServer --> CaptionService[Caption API: AssemblyAI, Whisper]
    NextServer --> VideoComposition[Video Composition: Remotion, FFmpeg, Cloud Video API]
    NextServer --> OAuthProviders[OAuth Providers: Google (YouTube)]
    
    subgraph "Client-Side (Browser)"
        Browser
    end
    
    subgraph "Server-Side (Vercel/Node.js Environment)"
        NextServer
        VideoComposition
        DB
        OpenAIService
        StockMediaAPIs
        TTSService
        CaptionService
        OAuthProviders
    end
```

## Key Architectural Components & Patterns

1.  **Frontend (Client-Side Rendering & Server Components):**
    *   **Technology:** Next.js (React)
    *   **Location:** `src/app/` (App Router), `src/app/components/`
    *   **Pattern:** Likely uses a mix of Server Components for initial render and Client Components for interactivity. Pages are defined in `src/app/dashboard/`, `src/app/page.tsx`.
    *   **Styling:** `src/app/globals.css` suggests global styles, potentially with CSS Modules or Tailwind CSS (postcss.config.mjs is present).

2.  **Backend (API Routes):**
    *   **Technology:** Next.js API Routes (Node.js environment)
    *   **Location:** `src/app/api/`
    *   **Pattern:** RESTful API endpoints for various functionalities:
        *   `ai/`: Endpoints for AI-driven tasks (image, script, voiceover generation, URL processing).
        *   `connections/`: Managing user's external account connections.
        *   `oauth/`: Handling OAuth 2.0 flows for third-party authentications.
        *   `video/`: Endpoints for video composition (initiating jobs, checking status).
        *   `youtube/`: Specific integration for YouTube (e.g., uploading).

3.  **Database Interaction:**
    *   **Technology:** Drizzle ORM with a SQL database.
    *   **Location:** `src/db/index.ts` (DB client setup), `src/db/schema.ts` (database schema definitions), `drizzle/migrations/` (database migrations).
    *   **Pattern:** ORM pattern for abstracting database operations. Migrations are managed by Drizzle Kit.

4.  **Video Generation/Composition:**
    *   **Technology:** Remotion
    *   **Location:** `remotion/` (Remotion project setup, components like `Root.tsx`, `VideoAssembly.tsx`), `src/app/api/video/compose/` (API to trigger Remotion rendering).
    *   **Pattern:** Likely an asynchronous job-based system. The API route `src/app/api/video/compose/route.ts` initiates a rendering job (using Remotion, FFmpeg, or a cloud video API), and `src/app/api/video/compose/status/route.ts` checks its progress. `jobStore.ts` likely tracks these jobs.

5.  **AI Integration (Direct API Calls):**
    *   **Location:** `src/app/api/ai/`
    *   **Pattern:** API endpoints acting as a backend-for-frontend (BFF) to various external AI services:
        *   **Text Processing/Scripting:** OpenAI API (GPT-3.5/4) via `openai` SDK.
        *   **Stock Media:** Pexels API, Pixabay API (requires separate SDKs or direct HTTP calls).
        *   **Text-to-Speech (TTS):** ElevenLabs, Google Cloud TTS, Azure TTS (requires specific SDKs or HTTP calls).
        *   **Caption Generation:** AssemblyAI, OpenAI Whisper (via `openai` SDK or specific SDKs).
    *   These endpoints orchestrate calls to the respective AI services based on user input and workflow.

6.  **Authentication & Authorization:**
    *   **User Authentication:** Clerk (`@clerk/nextjs`) handles user sign-up, sign-in, session management, and profile management. Integrated via `src/middleware.ts` and frontend components.
    *   **OAuth for Social Connections (YouTube):** `src/app/api/oauth/[platform]/` (specifically for `youtube`) handles OAuth 2.0 flows. `googleapis` SDK is used for YouTube interactions. Secure storage of tokens in the database (encrypted) is critical.

7.  **Configuration:**
    *   `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `jest.config.ts`, `drizzle.config.ts` handle configurations for Next.js, PostCSS, TypeScript, Jest (testing), and Drizzle respectively.

8.  **Middleware:**
    *   **Location:** `src/middleware.ts`
    *   **Pattern:** Used for running code before a request is completed. Common use cases include authentication, redirection, and modifying request/response headers.

## Design Patterns (Inferred)

*   **MVC/MVVM-like:** Next.js with React components often resembles these patterns, separating concerns between data, presentation, and logic.
*   **Repository/Service Layer:** The Drizzle ORM setup might be used within a repository pattern for data access, potentially with service layers in the API routes to handle business logic.
*   **Asynchronous Task Processing:** For video rendering and potentially some AI tasks, an async job queue pattern is likely used.
    *   **Strategy Pattern:** Different AI generation types (script, stock media selection, voiceover, captions) likely use a strategy pattern within `src/app/api/ai/` routes to call the appropriate external AI services.
    *   **Facade Pattern:** Each endpoint in `src/app/api/ai/` acts as a facade, simplifying the interaction with one or more external AI services for a specific task (e.g., `generate-voiceover` might call ElevenLabs).

## Data Flow (Example: Video Creation from URL for YouTube Short)

1.  User inputs a URL in the frontend (`src/app/dashboard/create-video/page.tsx`).
2.  Frontend calls `POST /api/ai/process-url` with the URL.
3.  `process-url/route.ts` fetches content, processes it (e.g., extracts text using an AI model like GPT or a simpler parser).
4.  Frontend calls `POST /api/ai/generate-script` with the processed text.
5.  `generate-script/route.ts` interacts with OpenAI API (GPT) to generate a video script.
6.  Frontend calls `POST /api/ai/generate-voiceover` with the script.
7.  `generate-voiceover/route.ts` interacts with a TTS AI service (e.g., ElevenLabs).
8.  (Concurrently or sequentially) Frontend might call an endpoint to fetch relevant stock media suggestions based on the script, which in turn calls Pexels/Pixabay.
9.  (Concurrently or sequentially) Frontend calls an endpoint for caption generation using AssemblyAI/Whisper.
10. User confirms choices (media, voice, script). Frontend calls `POST /api/video/compose` with all assets and instructions.
11. `compose/route.ts` initiates a video composition job (Remotion/FFmpeg/Cloud API), stores job ID.
10. Frontend polls `GET /api/video/compose/status/[jobId]` for progress.
11. Once complete, user can download or publish (e.g., via `POST /api/youtube/upload`).

This is an initial assessment based on the file structure. Further code review would be needed to confirm these patterns and discover more nuanced architectural details.
