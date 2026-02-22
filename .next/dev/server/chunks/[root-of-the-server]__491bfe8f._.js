module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/auth/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "getAuth",
    ()=>getAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$dist$2f$next$2f$server$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/dist/next/server/index.mjs [app-route] (ecmascript)");
;
function getAuth() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$dist$2f$next$2f$server$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createNeonAuth"])({
        baseUrl: process.env.NEON_AUTH_BASE_URL,
        cookies: {
            secret: process.env.NEON_AUTH_COOKIE_SECRET
        }
    });
}
// Normalize Neon's { data, error } so session?.user works everywhere (dashboard, API routes)
async function getSessionNormalized() {
    const { data } = await getAuth().getSession();
    const user = data?.user ?? data?.session?.user;
    if (!user) return null;
    return {
        ...data,
        user
    };
}
const auth = {
    getSession: getSessionNormalized,
    handler: ()=>getAuth().handler(),
    middleware: (config)=>getAuth().middleware(config)
};
}),
"[project]/app/api/auth/[...path]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/server.ts [app-route] (ecmascript)");
;
function rewriteCookiePath(cookie) {
    const parts = cookie.split(';').map((part)=>part.trim());
    let hasPath = false;
    const updated = parts.map((part)=>{
        if (part.toLowerCase().startsWith('path=')) {
            hasPath = true;
            return 'Path=/';
        }
        return part;
    });
    if (!hasPath) updated.push('Path=/');
    return updated.join('; ');
}
async function GET(request, context) {
    const { GET: handler } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuth"])().handler();
    const response = await handler(request, context ?? {
        params: {}
    });
    const setCookies = response.headers.getSetCookie?.() ?? [];
    if (setCookies.length === 0) return response;
    const headers = new Headers(response.headers);
    headers.delete('set-cookie');
    for (const cookie of setCookies){
        headers.append('set-cookie', rewriteCookiePath(cookie));
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
async function POST(request, context) {
    const { POST: handler } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuth"])().handler();
    const response = await handler(request, context ?? {
        params: {}
    });
    const setCookies = response.headers.getSetCookie?.() ?? [];
    if (setCookies.length === 0) return response;
    const headers = new Headers(response.headers);
    headers.delete('set-cookie');
    for (const cookie of setCookies){
        headers.append('set-cookie', rewriteCookiePath(cookie));
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__491bfe8f._.js.map