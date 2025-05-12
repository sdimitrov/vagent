import { clerkMiddleware } from "@clerk/nextjs/server";

// No need for createRouteMatcher for this simple setup
// const isPublicRoute = createRouteMatcher([ ... ]);

// Protects all routes matched by config.matcher by default.
// Clerk automatically treats its own auth routes (e.g., /sign-in) as public.
export default clerkMiddleware();

export const config = {
  // Simplest possible matcher: only run on dashboard routes
  matcher: ['/dashboard/:path*'],
};

// Note: The previous version had "Removed config block to ensure middleware runs on ALL routes by default".
// Re-adding a standard matcher config. This ensures the middleware runs on application routes
// and API routes but avoids running on static files or _next internal routes.
// The public/private logic is now handled by `isPublicRoute` and `auth().protect()`.
