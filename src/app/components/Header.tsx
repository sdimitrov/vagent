import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="bg-slate-800 shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-white">
          SociAI Reels
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link href="/" className="text-gray-300 hover:text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm font-medium">
            Home
          </Link>
          <SignedIn>
            <Link href="/dashboard" className="text-gray-300 hover:text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/dashboard/create-video" className="text-gray-300 hover:text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm font-medium">
              Create Video
            </Link>
            <Link href="/dashboard/connections" className="text-gray-300 hover:text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm font-medium">
              Connections
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-gray-300 hover:text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm font-medium">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm font-medium">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
} 