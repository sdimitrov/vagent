# Project Plan: SociAI Reels

## 1. Project Overview

- **App Name**: SociAI Reels
- **Core Idea**: An application that empowers users to automatically generate engaging short-form social media videos using AI and manage their posting directly.
- **Elevator Pitch**: Stop spending hours creating social content! SociAI Reels uses AI to generate short videos for you and helps you post them, so you can focus on growing your brand.

## 2. Goals

- Provide a seamless, automated solution for social media video content creation and management.
- Simplify the content workflow for individuals and businesses.
- Leverage AI for creative video generation.
- Achieve a user-friendly interface that requires minimal technical expertise for basic use.

## 3. Target Audience

- Social Media Managers
- Content Creators & Influencers
- Small to Medium-sized Businesses
- Marketing Agencies
- Solopreneurs looking to enhance their social media presence efficiently.

## 4. Key Features (Minimum Viable Product - MVP)

1.  **User Authentication & Management** (Clerk - *Implemented*)
    - Secure sign-up, sign-in, and profile management.
2.  **Landing Page** (*Implemented*)
    - Compelling overview of the app and its benefits.
    - Call to action for user sign-up.
3.  **Dashboard** (Basic Structure - *Implemented*)
    - Central hub for accessing app features after login.
4.  **Connect Social Media Accounts**
    - Securely link accounts via OAuth 2.0, initially focusing on: YouTube (Shorts). (*YouTube OAuth partially implemented*)
    - Store and manage connection tokens securely.
    - *Support for other platforms (TikTok, Instagram, etc.) to be considered post-MVP.*
5.  **AI Video Generation Module**
    -   **Input Methods**:
        -   Text prompt describing the video content/topic.
        -   URL of an article or blog post to summarize and visualize.
        -   User-provided script.
    -   **AI Capabilities** (Direct API Integrations):
        -   Select/suggest relevant stock footage and images (via Pexels, Pixabay APIs, etc.).
        -   Generate voiceover from script/text (Text-to-Speech API, e.g., ElevenLabs).
        -   Generate and overlay captions/subtitles (e.g., AssemblyAI, OpenAI Whisper).
        -   Basic video assembly (stitching clips, adding text overlays, simple transitions - e.g., using FFmpeg on the server or a cloud video API).
    -   **Output**: Downloadable short video file (e.g., MP4) optimized for social platforms.
6.  **Video Management & Basic Posting**
    -   View a list of all videos generated by the user.
    -   Preview generated videos.
    -   Edit basic video metadata (title, description).
    -   Delete videos.
    -   Simplified interface to initiate posting of a generated video to a connected platform (e.g., YouTube).
    -   *Advanced scheduling features to be considered post-MVP.*

## 5. Technology Stack

-   **Frontend**: Next.js, React, Tailwind CSS (*Chosen & Partially Implemented*)
-   **Authentication**: Clerk (*Chosen & Implemented*)
-   **Backend Logic**: Next.js API Routes (for internal operations, managing user data, interacting with AI/social APIs).
-   **Database**: PostgreSQL with Drizzle ORM (*Chosen & Partially Implemented*)
    -   To store: user profiles, video metadata, social media tokens (encrypted), basic scheduling info.
-   **AI Video Generation APIs/Libraries** (Direct Integration):
    -   **Text Processing/Scripting**: OpenAI API (GPT-3.5/4) for script generation/summarization.
    -   **Stock Media**: Pexels API, Pixabay API, or similar for royalty-free images and video clips.
    -   **Text-to-Speech (TTS)**: ElevenLabs, Google Cloud TTS, Azure TTS, or open-source alternatives.
    -   **Video Composition/Editing**: FFmpeg (server-side), or cloud-based video APIs (e.g., Shotstack, Editframe) if budget allows. Remotion could be considered if a Node.js based approach is preferred.
    -   **Caption Generation**: AssemblyAI, OpenAI Whisper (for transcription if needed, then formatting).
-   **Automation Workflow**: Handled by backend logic within the application itself.

## 6. Development Phases & Timeline (High-Level - Revised)

1.  **Phase 1: Foundation & Core Setup** (Q3 2024 - *Largely Complete*)
    -   Next.js project initialization, Tailwind CSS, Clerk authentication.
    -   Basic landing page and dashboard structure.
    -   Database setup (PostgreSQL, Drizzle).
2.  **Phase 2: Social Media Integration (YouTube Focus)** (Q3-Q4 2024 - *In Progress*)
    -   Implement and finalize OAuth 2.0 flow for YouTube.
    -   Secure token storage and management, including basic validation/refresh if feasible.
3.  **Phase 3: AI Video Generation - Core Engine (Direct API Integration)** (Q4 2024 - Q1 2025)
    -   Integrate text input for video idea.
    -   Integrate stock media API (e.g., Pexels).
    -   Integrate TTS API (e.g., ElevenLabs).
    -   Develop basic server-side video assembly (e.g., image slideshow with voiceover & text using FFmpeg or a chosen video API).
    -   Integrate caption generation.
4.  **Phase 4: Video Management & Basic YouTube Posting** (Q1 2025)
    -   Develop video listing, preview, metadata editing, and deletion.
    -   Implement functionality to upload the generated video to YouTube using the stored credentials.
    -   Refine AI video generation quality and options based on initial tests.
    -   Improve UI/UX for the video generation and posting flow.
5.  **Phase 5: Beta Testing & Iteration** (Q2 2025)
    -   Invite a small group of users for beta testing the YouTube video generation and posting.
    -   Gather feedback and iterate on features and usability.
6.  **Phase 6: Public Launch (YouTube Focus) & Future Platform Planning** (Q3 2025)
    -   Public release of MVP focusing on YouTube automation.
    -   Plan integration for other platforms (TikTok, Instagram) based on user feedback and market trends.
    -   Continue adding features and AI enhancements.

## 7. Potential Challenges & Risks

-   **Complexity of AI Pipeline**: Integrating multiple AI services for video generation can be technically challenging and require robust error handling.
-   **Social Media API Limits & Changes**: APIs can change, have rate limits, or deprecate features, requiring ongoing maintenance (especially for video uploads).
-   **Cost Management**: AI API calls, video processing/storage, and data storage can become expensive. Need to optimize and plan pricing accordingly.
-   **Content Quality**: Ensuring the AI-generated videos meet a reasonable quality standard for users.
-   **Video Processing Time**: Server-side video rendering can be resource-intensive and time-consuming.
-   **Competition**: The space for social media automation and AI content creation is growing.

## 8. Monetization Strategy (Post-MVP)

-   **Subscription Tiers**: Monthly/annual subscriptions based on:
    -   Number of videos generated per month.
    -   Video duration/resolution limits.
    -   Access to premium AI features (e.g., higher quality voiceovers, advanced editing options).
-   **Pay-as-you-go**: For specific premium services (e.g., generating extra-long videos, using premium stock media).
-   **Team/Agency Plans**: Higher-tier plans for multiple users and client management.

## 9. Success Metrics

-   Number of active users.
-   Number of videos generated and posted to YouTube.
-   User engagement and retention rates.
-   Conversion rate from free/trial to paid plans.
-   User satisfaction scores (NPS, surveys).

## 10. Future Considerations

-   Integration with other social media platforms (TikTok, Instagram Reels, etc.).
-   Advanced AI video editing features (e.g., brand kits, custom animations, scene detection).
-   AI-powered content idea generation and trend analysis.
-   Deeper analytics on video performance.
-   Advanced scheduling options.
-   Community features for users to share tips. 