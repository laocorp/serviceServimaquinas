import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthRoute = req.nextUrl.pathname.startsWith('/login');
    const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL('/dashboard', req.nextUrl));
        }
        return null;
    }

    if (!isLoggedIn && isDashboardRoute) {
        return Response.redirect(new URL('/login', req.nextUrl));
    }

    return null;
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
