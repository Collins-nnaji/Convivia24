declare module '@neondatabase/auth/next' {
  export function createAuthClient(): any;
}
declare module '@neondatabase/auth/next/server' {
  export function createNeonAuth(config: {
    baseUrl: string;
    cookies: { secret: string; sessionDataTtl?: number; domain?: string };
  }): any;
}
