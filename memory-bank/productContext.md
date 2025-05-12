# Product Context: SociAI Reels

## Problem Statement

Creating engaging short-form social media video content consistently is complex, time-consuming, and often requires specialized skills or software. Social media managers, content creators, and businesses struggle with:
*   **Content Ideation & Scripting:** Continuously generating fresh ideas and scripts for short videos.
*   **Asset Sourcing & Creation:** Finding or producing relevant visuals (stock footage, images) and voiceovers.
*   **Technical Video Editing:** The complexity of traditional video editing tools for quick, impactful shorts.
*   **Platform-Specific Optimization:** Tailoring content for platforms like YouTube Shorts, TikTok, Instagram Reels.
*   **Posting Consistency:** Maintaining a regular posting schedule across platforms.
*   **Time Constraints:** The significant time investment required for the end-to-end video creation and posting process.

SociAI Reels aims to address these pain points by providing an AI-powered platform that automates and simplifies the creation and posting of short-form social media videos.

## How It Should Work (User Journey - MVP for YouTube Shorts)

1.  **Sign Up/Login (Clerk):** Users create an account or log in.
2.  **Landing Page:** New users are introduced to SociAI Reels' benefits and prompted to sign up.
3.  **Dashboard:**
    *   Central hub to view generated videos, start new projects, and manage connected accounts.
4.  **Connect Social Media Accounts:**
    *   User navigates to a "Connections" section.
    *   Initiates OAuth flow to securely link their YouTube account.
    *   Grants necessary permissions for SociAI Reels to upload videos (Shorts).
5.  **AI Video Generation:**
    *   **Start New Project:** User chooses an input method:
        *   **Text Prompt:** Describe the desired video content/topic.
        *   **URL:** Provide a link to an article or blog post for summarization and visualization.
        *   **Script:** Upload or paste a pre-written script.
    *   **AI Processing:**
        *   The system uses AI (e.g., OpenAI GPT) to process the input and generate/refine a script.
        *   AI suggests/selects relevant stock footage and images (e.g., from Pexels, Pixabay) based on the script.
        *   AI generates a voiceover from the script using a TTS service (e.g., ElevenLabs).
        *   AI generates captions/subtitles (e.g., using AssemblyAI or OpenAI Whisper).
    *   **Video Assembly:** The system uses a video composition engine (e.g., Remotion, FFmpeg, or cloud video API) to stitch together selected media, voiceover, and captions into a short video.
    *   **Preview:** User can preview the AI-generated video.
6.  **Video Management & Posting:**
    *   **Video List:** Generated videos are listed in the dashboard with options to preview, edit metadata, or delete.
    *   **Edit Metadata:** User can edit the video title and description.
    *   **Post to YouTube:** User selects a video and initiates posting to their connected YouTube account. The system handles the upload.
    *   **Download:** User can download the generated MP4 video file.

## User Experience Goals

*   **Automation & Efficiency:** Drastically reduce the manual effort and time required to produce and post social media videos. "Stop spending hours creating social content!"
*   **Simplicity & Accessibility:** Provide an intuitive interface that requires minimal technical video editing expertise for core tasks.
*   **Creativity Augmentation:** Leverage AI to help users generate creative video ideas, scripts, and visuals.
*   **Seamless Integration:** Offer a smooth workflow from content generation to direct posting on social platforms (initially YouTube).
*   **Consistent Quality:** Enable the creation of engaging and professional-looking short-form videos suitable for social media.
*   **User Control:** While AI automates heavily, allow users to review, make basic edits (metadata), and approve content before posting.

## Core Value Proposition

SociAI Reels empowers users to effortlessly create and post engaging short-form social media videos by leveraging AI for content generation and automation, allowing them to focus on growing their brand and audience.
