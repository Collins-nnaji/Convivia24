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
"[project]/lib/db/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/serverless/index.mjs [app-route] (ecmascript)");
;
let _sql = null;
function getSql() {
    if (!_sql) _sql = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["neon"])(process.env.DATABASE_URL);
    return _sql;
}
// Export a real function so Turbopack/bundler treats it as callable (Proxy can break in server bundle).
// Return type ensures destructuring (e.g. const [row] = await sql`...`) type-checks.
function sql(strings, ...values) {
    return getSql()(strings, ...values);
}
const __TURBOPACK__default__export__ = sql;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/auth/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADMIN_EMAILS",
    ()=>ADMIN_EMAILS,
    "getAppUser",
    ()=>getAppUser,
    "getSession",
    ()=>getSession,
    "isAdmin",
    ()=>isAdmin,
    "requireAdmin",
    ()=>requireAdmin,
    "requireAuth",
    ()=>requireAuth,
    "syncUser",
    ()=>syncUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-route] (ecmascript)");
;
;
;
const ADMIN_EMAILS = [
    'collinsnnaji1@gmail.com',
    'speak2tojo@gmail.com'
];
const ADMIN_EMAILS_LOWER = ADMIN_EMAILS.map((e)=>e.toLowerCase());
function isAdmin(email) {
    return !!email && ADMIN_EMAILS_LOWER.includes(email.toLowerCase().trim());
}
async function getSession() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"].getSession();
}
async function requireAuth() {
    const session = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"].getSession();
    if (!session?.user) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redirect"])('/auth/sign-in');
    return session.user;
}
async function requireAdmin() {
    const user = await requireAuth();
    const appUser = await getAppUser({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
    });
    if (appUser.role !== 'admin') (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redirect"])('/dashboard?admin=denied');
    return user;
}
async function syncUser(authUser) {
    const emailNorm = (authUser.email ?? '').toLowerCase().trim();
    const role = isAdmin(authUser.email) ? 'admin' : 'client';
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]`
    INSERT INTO app_users (id, email, name, image, role)
    VALUES (${authUser.id}, ${emailNorm}, ${authUser.name ?? null}, ${authUser.image ?? null}, ${role})
    ON CONFLICT (email) DO UPDATE
      SET name  = EXCLUDED.name,
          image = EXCLUDED.image,
          id    = EXCLUDED.id,
          role  = EXCLUDED.role
    RETURNING *
  `;
    return rows[0];
}
async function getAppUser(authUser) {
    const emailNorm = (authUser.email ?? '').toLowerCase().trim();
    if (!emailNorm) return syncUser(authUser);
    // Case-insensitive lookup so session email (e.g. "User@Email.com") matches DB ("user@email.com")
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]`
    SELECT * FROM app_users WHERE LOWER(TRIM(email)) = ${emailNorm}
  `;
    if (rows.length === 0) return syncUser(authUser);
    const row = rows[0];
    if (isAdmin(authUser.email) && row.role !== 'admin') {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]`UPDATE app_users SET role = 'admin' WHERE id = ${row.id}`;
        const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]`SELECT * FROM app_users WHERE id = ${row.id}`;
        return updated[0];
    }
    return row;
}
}),
"[project]/lib/auth/access.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Access control for the platform. Scales by using app_users.role as source of truth.
 *
 * - Admin: only users with role 'admin' (set from ADMIN_EMAILS on login via syncUser).
 * - Client: everyone else; access scoped by client_users (which client they belong to).
 *
 * To add more admins: add email to ADMIN_EMAILS in lib/auth/session.ts and have that
 * user log in once (syncUser sets role). Later you can add "promote to admin" by
 * updating app_users.role in the DB.
 */ __turbopack_context__.s([
    "canAccessAdmin",
    ()=>canAccessAdmin,
    "canAccessDashboard",
    ()=>canAccessDashboard
]);
function canAccessAdmin(appUser) {
    return appUser?.role === 'admin';
}
function canAccessDashboard(appUser) {
    return !!appUser;
}
}),
"[project]/app/api/me/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/access.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-route] (ecmascript)");
;
;
;
;
;
async function GET() {
    const session = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"].getSession();
    if (!session?.user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'Unauthorized'
    }, {
        status: 401
    });
    const appUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppUser"])({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
    });
    const me = {
        role: appUser.role,
        email: appUser.email,
        name: appUser.name
    };
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canAccessAdmin"])(appUser)) {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]`
      SELECT id, name FROM clients ORDER BY name
    `;
        me.clients = rows;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(me);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ff702223._.js.map