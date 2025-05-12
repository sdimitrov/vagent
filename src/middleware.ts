import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  '/', // Landing page
  // Add other public routes here, e.g., '/sign-in(.*)', '/sign-up(.*)'
  // Clerk's own routes for sign-in, sign-up are typically handled automatically or might need to be listed
  // if you have custom pages for them that should be public.
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    // For public routes, do nothing. Clerk will not interfere.
    return;
  }
  // For all other routes, protect them
  auth.protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

// Note: The previous version had "Removed config block to ensure middleware runs on ALL routes by default".
// Re-adding a standard matcher config. This ensures the middleware runs on application routes
// and API routes but avoids running on static files or _next internal routes.
// The public/private logic is now handled by `isPublicRoute` and `auth().protect()`.
