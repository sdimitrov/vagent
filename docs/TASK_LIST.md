# Task List: SociAI Reels

## Phase 1: Foundation & Core Setup (Largely Complete)

- [x] Initialize Next.js project (`create-next-app`)
- [x] Configure Tailwind CSS
- [x] Set up Clerk for authentication
- [x] Create basic project structure (`src` directory)
- [x] Implement `ClerkProvider` in root layout (`src/app/layout.tsx`)
- [x] Add Sign In/Sign Up/UserButton to header (`src/app/components/Header.tsx` added to `src/app/layout.tsx`)
- [x] Create `middleware.ts` for route protection (`src/middleware.ts`)
- [x] Configure middleware for public home page (now protects all by default, can be configured if needed)
- [x] Create basic Dashboard page structure (`src/app/dashboard/page.tsx`)
- [x] Create initial Landing Page (`src/app/page.tsx`)
- [x] **BUGFIX**: Resolve "Event handlers cannot be passed to Client Component props" for landing page button. (Resolved with `GetStartedButton` component)
- [x] Create `docs/PROJECT_PLAN.md` (Updated)
- [x] Create `docs/TASK_LIST.md` (This update)
- [x] Set up PostgreSQL database with Drizzle ORM (`drizzle.config.ts`, `src/db/schema.ts`, `src/db/index.ts`)
- [x] Implement API route for deleting social connections (`src/app/api/connections/[id]/route.ts`)
- [x] Update frontend to call delete connection API and reflect changes (`src/app/dashboard/connections/components/ConnectedAccountsList.tsx`)

## Phase 2: Social Media Integration (YouTube Focus) (Q3-Q4 2024 - In Progress)

### 2.1 General OAuth Setup (Completed for YouTube)
- [x] Design database schema for storing user social media connection tokens (`socialConnections` table in `src/db/schema.ts`).
- [x] Implement secure backend logic (API routes) for handling OAuth callbacks. (`src/app/api/oauth/[platform]/callback/route.ts` for YouTube).
- [x] Create UI components for managing connected accounts. (`src/app/dashboard/connections/page.tsx` and its sub-components).
- [x] Implement OAuth initiation route (`src/app/api/oauth/[platform]/authorize/route.ts` for YouTube).

### 2.2 YouTube (Shorts) Integration
- [x] Register app with Google Cloud Platform, configure OAuth consent screen. (User task - assumed complete)
- [x] Implement YouTube Data API OAuth 2.0 flow for `youtube.upload` and other necessary scopes (e.g., `youtube.readonly` for channel info). (Token exchange & storage for YouTube implemented).
- [~] Store YouTube access/refresh tokens securely (DB fields and placeholder encryption exist; real encryption logic TBD).
- [~] Test uploading a sample video short to YouTube via API (API route and uploader UI exist, but actual upload call is simulated/commented out).
- [ ] *Optional: Implement token validation/refresh check for YouTube.*

## Phase 3: AI Video Generation - Core Engine (Direct API Integration) (Q4 2024 - Q1 2025)

### 3.1 Input & Scripting
- [x] UI for text prompt input for video idea.
- [x] UI for URL input (article/blog post to be summarized).
- [x] UI for direct script input (user provides their own script).
- [ ] Integrate OpenAI API (GPT-3.5/4) for:
    - [x] Text summarization (from URL).
    - [x] Script generation assistance (from text prompt).
    - [ ] Formatting user-provided script if necessary.

### 3.2 Media Acquisition (e.g., Pexels/Pixabay)
- [ ] Integrate a stock media API (e.g., Pexels) for image/video search based on keywords from script/prompt.
- [ ] Backend logic to fetch and suggest media.
- [~] UI for user to review AI-generated images exists; selection from stock media or custom media upload for video segments is not implemented.

### 3.3 Voiceover & Captions
- [ ] Integrate Text-to-Speech API (e.g., ElevenLabs, Google Cloud TTS).
- [ ] UI for selecting voice, language, and other TTS options.
- [ ] Backend logic to generate voiceover from the script.
- [ ] Integrate caption generation (e.g., from TTS output or using a service like AssemblyAI on the voiceover, or Whisper if original audio is involved).
- [ ] UI for reviewing/editing generated captions.

### 3.4 Video Assembly
- [x] Choose primary video composition technology (Remotion)
- [ ] Set up Remotion in the project (install dependencies, scaffold structure)
- [ ] Create Remotion composition for video assembly (images, captions, audio)
- [ ] Implement logic to sequence images and captions based on script/voiceover
- [ ] Add support for background audio/voiceover
- [ ] Add support for caption overlays (timed with voiceover text)
- [ ] Add simple transitions (fade, etc.) between images
- [ ] Render video to MP4 using Remotion CLI
- [ ] Integrate Remotion rendering into backend workflow (API route or job)
- [ ] Ensure output is in a standard format (MP4) and optimized for YouTube Shorts (aspect ratio, length)
- [ ] (Optional) Add UI to preview Remotion video before rendering

## Phase 4: Video Management & Basic YouTube Posting (Q1 2025)

- [ ] Database schema updates for storing video metadata (title, description, source prompt/script, generated file path/ID, status, etc.).
- [ ] UI to list all user-generated videos (with thumbnails, status, creation date).
- [ ] Video preview functionality within the app (linking to the generated video file).
- [ ] UI to edit video metadata (title, description, tags for YouTube).
- [ ] Implement video deletion (both from database and storage if applicable).
- [ ] **Implement YouTube Upload Functionality**:
    - [ ] Backend API route to handle video upload requests.
    - [ ] Use stored YouTube OAuth tokens to upload the generated video file and its metadata to the user's YouTube channel.
    - [ ] Handle API responses from YouTube (success, errors, quotas).
- [ ] Update UI to allow users to initiate the upload of a generated video to YouTube.
- [ ] Refine AI video generation quality based on initial tests.
- [ ] Iterate on UI/UX for the video generation and posting flow.

## Phase 5: Beta Testing & Iteration (Q2 2025)

- [ ] Prepare beta program (invitation system, feedback channels).
- [ ] Onboard a small group of beta testers for the YouTube video generation and posting workflow.
- [ ] Actively collect and categorize feedback.
- [ ] Prioritize and implement bug fixes and key improvements from beta feedback.

## Phase 6: Public Launch (YouTube Focus) & Future Platform Planning (Q3 2025)

- [ ] Final pre-launch checks (security, performance, scalability for YouTube features).
- [ ] Prepare marketing materials and announcement.
- [ ] Publicly launch SociAI Reels MVP with YouTube automation.
- [ ] Monitor system performance and user activity.
- [ ] Begin planning for integration of other platforms (e.g., TikTok, Instagram Reels) based on user feedback and market analysis.
- [ ] Continue work on post-MVP features based on the revised project plan and user feedback.

## General/Ongoing Tasks

- [x] Set up Jest and React Testing Library for unit/integration tests. (Initial setup done, more tests needed)
- [ ] Write more unit and integration tests for key functionalities (API routes, components, AI service integrations).
- [ ] Maintain and update documentation (`PROJECT_PLAN.md`, `TASK_LIST.md`, code comments).
- [ ] Regular code reviews and refactoring to maintain code quality.
- [ ] Monitor and update dependencies.
- [ ] Consider setting up a CI/CD pipeline for automated testing and deployments (e.g., using GitHub Actions).
- [ ] Manage API keys and sensitive configuration securely (e.g., using `.env.local`, Vercel environment variables for deployment). 