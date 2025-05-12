# Project Brief: SociAI Reels

## Core Project Goal

To develop "SociAI Reels," an application that empowers users to automatically generate engaging short-form social media videos using AI and manage their posting directly, initially focusing on YouTube Shorts. The application aims to simplify the content workflow for individuals and businesses.

## High-Level Requirements (MVP Focus)

*   **User Authentication & Management:** Secure sign-up, sign-in, and profile management (using Clerk).
*   **Landing Page:** Overview of the app and call to action.
*   **Dashboard:** Central hub for accessing app features.
*   **Connect Social Media Accounts (YouTube First):** Securely link YouTube accounts via OAuth 2.0 for posting Shorts. Secure token management.
*   **AI Video Generation Module:**
    *   **Input Methods:** Text prompt, URL (article/blog post), user-provided script.
    *   **AI Capabilities:**
        *   Select/suggest stock footage/images (e.g., Pexels, Pixabay APIs).
        *   Generate voiceover from script/text (e.g., ElevenLabs TTS).
        *   Generate and overlay captions/subtitles (e.g., AssemblyAI, OpenAI Whisper).
        *   Basic video assembly (stitching clips, text overlays, simple transitions - using Remotion, FFmpeg, or a cloud video API).
    *   **Output:** Downloadable MP4 optimized for social platforms.
*   **Video Management & Basic Posting (YouTube):**
    *   List, preview, edit metadata (title, description), delete generated videos.
    *   Simplified interface to post videos to connected YouTube accounts.
*   **Database (PostgreSQL with Drizzle ORM):** Store user profiles, video metadata, encrypted social media tokens, basic scheduling info.

## Target Audience

*   Social Media Managers
*   Content Creators & Influencers
*   Small to Medium-sized Businesses
*   Marketing Agencies
*   Solopreneurs

## Key Technologies (Confirmed & Planned)

*   **Frontend:** Next.js, React, Tailwind CSS
*   **Backend:** Next.js API Routes
*   **Authentication:** Clerk
*   **Database:** PostgreSQL with Drizzle ORM
*   **Video Composition:** Remotion (confirmed by `package.json`), FFmpeg, or cloud video APIs (e.g., Shotstack, Editframe) are considerations.
*   **AI Services (Direct API Integrations):**
    *   **Text Processing/Scripting:** OpenAI API (GPT-3.5/4)
    *   **Stock Media:** Pexels API, Pixabay API
    *   **Text-to-Speech (TTS):** ElevenLabs, Google Cloud TTS, Azure TTS
    *   **Caption Generation:** AssemblyAI, OpenAI Whisper
*   **OAuth:** For YouTube and potentially other platforms later.

## Scope (MVP)

The MVP focuses on YouTube Shorts automation: connecting YouTube accounts, AI video generation from various inputs (text, URL, script) using integrated AI services for stock media, TTS, and captions, basic video assembly, and direct posting to YouTube.
Future considerations include other platforms (TikTok, Instagram), advanced editing, AI content ideation, analytics, and scheduling.
