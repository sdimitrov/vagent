import Image from "next/image";
import GetStartedButton from "./components/GetStartedButton";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            SociAI Reels
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Automate your social media presence! Leverage AI and n8n to effortlessly generate engaging short videos and schedule posts across all your platforms.
          </p>
          <div className="space-x-4">
            <GetStartedButton />
          </div>
           <p className="mt-4 text-sm text-slate-400">Sign up or sign in using the buttons in the header!</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-100">
            Why Choose SociAI Reels?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-700/50 p-8 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="text-purple-400 mb-4">
                {/* Placeholder for an icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624L16.5 21.75l-.398-1.126a3.375 3.375 0 00-2.455-2.456L12.75 18l1.126-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.126a3.375 3.375 0 002.456 2.456L20.25 18l-1.126.398a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-100 text-center">AI Video Generation</h3>
              <p className="text-slate-300 text-center">
                Automatically create eye-catching short videos from your content ideas using cutting-edge AI.
              </p>
            </div>
            <div className="bg-slate-700/50 p-8 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="text-pink-400 mb-4">
                {/* Placeholder for an icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-100 text-center">Smart Scheduling</h3>
              <p className="text-slate-300 text-center">
                Plan your content calendar and schedule posts to multiple platforms seamlessly.
              </p>
            </div>
            <div className="bg-slate-700/50 p-8 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="text-red-400 mb-4">
                {/* Placeholder for an icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-100 text-center">n8n Powered Automation</h3>
              <p className="text-slate-300 text-center">
                Leverage the flexibility of n8n to create custom workflows and connect all your favorite tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-slate-400">&copy; ${new Date().getFullYear()} SociAI Reels. All rights reserved.</p>
      </footer>
    </div>
  );
}
