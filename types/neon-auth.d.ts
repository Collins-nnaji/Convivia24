declare module '@neondatabase/auth/next/server' {
  import { NextRequest, NextResponse } from 'next/server';

  type SessionData = {
    session: any;
    user: any;
  } | {
    session: null;
    user: null;
  };

  export function neonAuth(): Promise<SessionData>;

  export function neonAuthMiddleware(options: {
    loginUrl?: string;
  }): (request: NextRequest) => Promise<NextResponse>;

  export function authApiHandler(): {
    GET: (request: any, ctx: any) => Promise<Response>;
    POST: (request: any, ctx: any) => Promise<Response>;
    PUT: (request: any, ctx: any) => Promise<Response>;
    DELETE: (request: any, ctx: any) => Promise<Response>;
    PATCH: (request: any, ctx: any) => Promise<Response>;
  };

  export function createAuthServer(): any;
}

declare module '@neondatabase/auth/next' {
  export function createAuthClient(): any;
}

declare module '@neondatabase/auth/react/ui' {
  import { ComponentType, ReactNode } from 'react';

  export const NeonAuthUIProvider: ComponentType<{
    children?: ReactNode;
    authClient?: any;
    navigate?: (path: string) => void;
    replace?: (path: string) => void;
    optimistic?: boolean;
    socialProviders?: string[];
    [key: string]: any;
  }>;

  export const AuthView: ComponentType<{
    view?: string;
    redirectTo?: string;
    [key: string]: any;
  }>;

  export const AuthCallback: ComponentType<{
    [key: string]: any;
  }>;

  export const SignedIn: ComponentType<{ children?: ReactNode }>;
  export const SignedOut: ComponentType<{ children?: ReactNode }>;
  export const UserButton: ComponentType<any>;
  export const UserAvatar: ComponentType<any>;
  export const SignOut: ComponentType<any>;
  export const SignInForm: ComponentType<any>;
  export const SignUpForm: ComponentType<any>;
}

declare module '@neondatabase/auth/ui/tailwind' {
  const content: string;
  export default content;
}
