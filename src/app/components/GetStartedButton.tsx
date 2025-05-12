"use client";

export default function GetStartedButton() {
  return (
    <button 
      onClick={() => {
        // Attempt to find the Clerk Sign Up button in the header and click it
        // This assumes a specific structure for your header buttons
        const clerkHeader = document.querySelector('header > div > div > button:nth-child(2)'); // More specific selector for Clerk buttons
        if (clerkHeader instanceof HTMLElement) {
          clerkHeader.click();
        } else {
          // Fallback if the specific Clerk button structure isn't found
          const genericSignUpButton = Array.from(document.querySelectorAll('header button')).find(btn => btn.textContent?.toLowerCase().includes('sign up'));
          if (genericSignUpButton instanceof HTMLElement) {
            genericSignUpButton.click();
          } else {
            console.warn('SociAI Reels: Sign Up button not found in header for Get Started click.');
          }
        }
      }}
      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
    >
      Get Started Free
    </button>
  );
} 