# Tech Context: SociAI Reels

## Core Technologies

*   **Framework:** Next.js 15.3.2
    *   Full-stack capabilities (App Router for frontend and API routes for backend).
*   **Language:** TypeScript (version 5.x, inferred from `tsconfig.json` and devDependencies)
*   **UI Library:** React 19.1.0
*   **Styling:** Tailwind CSS (version 4.x, inferred from `tailwindcss` and `@tailwindcss/postcss` in devDependencies, and `postcss.config.mjs`)
*   **Database ORM:** Drizzle ORM 0.43.1
    *   **Database Driver:** `pg` 8.15.6 (PostgreSQL)
    *   **Migration Tool:** `drizzle-kit` 0.31.1
*   **Video Generation:** Remotion 4.0.298
    *   `@remotion/cli` for command-line operations.
    *   `@remotion/player` for embedding video players.
*   **Authentication:** `@clerk/nextjs` 6.19.1 (Handles user sign-up, sign-in, session management).

## AI & External Services (as per PROJECT_PLAN.md and package.json)

*   **Text Processing/Scripting:** OpenAI API (`openai` 4.98.0) - GPT-3.5/4 for script generation/summarization.
*   **Stock Media APIs:** Pexels API, Pixabay API (No specific SDKs in `package.json`, likely direct HTTP calls or to-be-added SDKs).
*   **Text-to-Speech (TTS):** ElevenLabs, Google Cloud TTS, Azure TTS (No specific SDKs in `package.json` yet, direct HTTP or to-be-added SDKs).
*   **Caption Generation:** AssemblyAI, OpenAI Whisper (Whisper via `openai` SDK, AssemblyAI would need its own SDK/HTTP calls).
*   **Video Composition:**
    *   Remotion 4.0.298 (Primary tool, as per `package.json` and `remotion/` directory).
    *   FFmpeg (Mentioned as a possibility, could be used server-side, not directly in `package.json` as a Node.js dependency unless a wrapper is used).
    *   Cloud Video APIs (e.g., Shotstack, Editframe - mentioned as alternatives, would require their respective SDKs if chosen).
*   **Social Media Integration (YouTube):** `googleapis` 148.0.0 for YouTube API interactions (uploads, etc.).

## Development & Tooling

*   **Package Manager:** npm (inferred from `package-lock.json`)
*   **Testing:**
    *   Jest 29.7.0
    *   `@testing-library/react` 16.3.0 for React component testing.
    *   `@testing-library/jest-dom` 6.6.3 for DOM assertions.
    *   `ts-jest` 29.3.2 for TypeScript support in Jest.
    *   `jest-environment-jsdom` for simulating a browser environment.
*   **Linting:** Next.js built-in ESLint (inferred from `next lint` script).
*   **TypeScript Execution:** `ts-node` 10.9.2 (for running TypeScript files directly, often used for scripts or Drizzle Kit).
*   **Environment Variables:** `dotenv` 16.5.0 (for managing environment variables, likely via a `.env` file).

## Development Setup (Inferred)

1.  **Prerequisites:**
    *   Node.js (version compatible with Next.js 15, likely Node.js 20.x as per `@types/node": "^20"`)
    *   npm
    *   PostgreSQL database instance.
    *   Access keys/credentials for:
        *   OpenAI API
        *   Google Cloud Platform (for YouTube API and OAuth)
        *   Clerk
        *   Pexels API, Pixabay API
        *   Chosen TTS service (e.g., ElevenLabs)
        *   Chosen Captioning service (e.g., AssemblyAI)
        *   (If applicable) Chosen Cloud Video API
2.  **Installation:** `npm install`
3.  **Environment Configuration:** Create a `.env` file with necessary API keys, database connection strings, Clerk credentials, etc.
4.  **Database Migrations:**
    *   Generate migrations: `npm run drizzle-kit generate` (or similar, actual script might be defined in `package.json` or run via `npx`)
    *   Apply migrations: A script to run migrations, possibly using `ts-node` to execute a Drizzle migration script.
5.  **Run Development Server:** `npm run dev` (starts Next.js dev server, typically on `http://localhost:3000`).
6.  **Remotion Studio (Optional):** `npx remotion studio` (from within the `remotion/` directory or project root if configured) to work on Remotion compositions.

## Technical Constraints & Considerations

*   **Serverless Environment (Vercel):** If deployed on Vercel (common for Next.js), be mindful of serverless function limitations (execution time, memory, cold starts) for API routes, especially for long-running tasks like video rendering or AI generation.
    *   The `jobStore.ts` and status polling mechanism for video composition suggests an awareness of this, offloading heavy work.
*   **Remotion Rendering:** Video rendering can be resource-intensive. Consider where Remotion rendering will occur (locally, dedicated server, or a service like Vercel Functions if within limits, or Remotion Lambda).
*   **API Rate Limits:** External services (OpenAI, Google APIs) will have rate limits. Implement proper error handling, retries, and potentially queuing.
*   **Database Connections:** Manage database connections efficiently, especially in a serverless context. Drizzle ORM helps, but connection pooling and query optimization are important.
*   **Security:**
    *   Securely manage API keys and secrets.
    *   Input validation for all API endpoints.
    *   Protect against common web vulnerabilities (XSS, CSRF, etc.). Clerk helps with auth-related security.
*   **Scalability:** Consider scalability of AI interactions, video processing, and database load as user base grows.

## Key Configuration Files

*   `package.json`: Project dependencies and scripts.
*   `tsconfig.json`: TypeScript compiler options.
*   `next.config.ts`: Next.js configuration.
*   `drizzle.config.ts`: Drizzle ORM/Kit configuration.
*   `postcss.config.mjs`: PostCSS configuration (for Tailwind CSS).
*   `jest.config.ts`: Jest testing framework configuration.
*   `.env` (not in repo, but crucial): Environment-specific variables.
