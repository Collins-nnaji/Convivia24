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
"[project]/lib/db.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "query",
    ()=>query,
    "sql",
    ()=>sql,
    "transaction",
    ()=>transaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/serverless/index.mjs [app-route] (ecmascript)");
;
// Handle missing DATABASE_URL gracefully for build time
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const sql = databaseUrl ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["neon"])(databaseUrl) : null;
async function query(text, params) {
    if (!sql) {
        throw new Error('Database connection not configured. Please set DATABASE_URL environment variable.');
    }
    try {
        const result = await sql(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
async function transaction(callback) {
    if (!sql) {
        throw new Error('Database connection not configured. Please set DATABASE_URL environment variable.');
    }
    try {
        const result = await callback(sql);
        return result;
    } catch (error) {
        console.error('Transaction error:', error);
        throw error;
    }
}
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/auth.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authenticate",
    ()=>authenticate,
    "comparePassword",
    ()=>comparePassword,
    "generateToken",
    ()=>generateToken,
    "getTokenFromRequest",
    ()=>getTokenFromRequest,
    "hashPassword",
    ()=>hashPassword,
    "requireRole",
    ()=>requireRole,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
async function hashPassword(password) {
    const salt = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].genSalt(10);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, salt);
}
async function comparePassword(password, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hash);
}
function generateToken(payload) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRE
    });
}
function verifyToken(token) {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}
function getTokenFromRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}
async function authenticate(request) {
    // DEVELOPMENT MODE: Allow access without authentication
    const DEV_MODE = ("TURBOPACK compile-time value", "development") === 'development' || true; // Allow dev mode for now
    if ("TURBOPACK compile-time truthy", 1) {
        // Return a mock admin user for development
        return {
            user: {
                id: 'dev-user-id',
                email: 'dev@convivia24.com',
                role: 'admin',
                business_id: null
            },
            error: null
        };
    }
    //TURBOPACK unreachable
    ;
    const token = undefined;
    const decoded = undefined;
}
function requireRole(...allowedRoles) {
    return async (request)=>{
        const authResult = await authenticate(request);
        if (authResult.error) {
            return authResult;
        }
        const user = authResult.user;
        if (!allowedRoles.includes(user.role)) {
            return {
                error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                status: 403
            };
        }
        return {
            user,
            error: null
        };
    };
}
}),
"[project]/app/api/bookings/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.js [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const authResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authenticate"])(request);
        if (authResult.error) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: authResult.error
            }, {
                status: authResult.status
            });
        }
        const { user } = authResult;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const business_id = searchParams.get('business_id');
        // Check if database is available
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]) {
            // Return mock data for development
            const mockBookings = [
                {
                    id: 'mock-1',
                    business_id: 'mock-business-1',
                    service_id: 'mock-service-1',
                    requested_by: user.id,
                    status: 'pending',
                    urgency: 'routine',
                    scheduled_start: new Date(Date.now() + 86400000).toISOString(),
                    scheduled_end: new Date(Date.now() + 86400000 + 14400000).toISOString(),
                    location_address: '123 Main Street, Lagos',
                    special_instructions: 'Please use eco-friendly cleaning products',
                    total_cost: 15000,
                    payment_status: 'pending',
                    business_name: 'TechCorp Nigeria',
                    service_name: 'Routine Commercial Cleaning',
                    service_type: 'routine',
                    requested_by_email: 'client@techcorp.com',
                    requested_by_first_name: 'John',
                    requested_by_last_name: 'Doe',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'mock-2',
                    business_id: 'mock-business-2',
                    service_id: 'mock-service-2',
                    requested_by: user.id,
                    status: 'in_progress',
                    urgency: 'urgent',
                    scheduled_start: new Date().toISOString(),
                    scheduled_end: new Date(Date.now() + 7200000).toISOString(),
                    location_address: '456 Business District, Abuja',
                    special_instructions: null,
                    total_cost: 35000,
                    payment_status: 'pending',
                    business_name: 'Healthcare Plus',
                    service_name: 'Rapid Response & Emergency Cleaning',
                    service_type: 'rapid',
                    requested_by_email: 'admin@healthcare.com',
                    requested_by_first_name: 'Sarah',
                    requested_by_last_name: 'Johnson',
                    created_at: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: 'mock-3',
                    business_id: 'mock-business-3',
                    service_id: 'mock-service-3',
                    requested_by: user.id,
                    status: 'completed',
                    urgency: 'routine',
                    scheduled_start: new Date(Date.now() - 172800000).toISOString(),
                    scheduled_end: new Date(Date.now() - 172800000 + 28800000).toISOString(),
                    actual_start: new Date(Date.now() - 172800000).toISOString(),
                    actual_end: new Date(Date.now() - 172800000 + 28800000).toISOString(),
                    location_address: '789 Corporate Plaza, Victoria Island',
                    special_instructions: 'Deep clean required',
                    total_cost: 50000,
                    payment_status: 'paid',
                    business_name: 'Finance Hub Ltd',
                    service_name: 'Deep Cleaning & Sanitation Reset',
                    service_type: 'deep',
                    requested_by_email: 'facilities@financehub.com',
                    requested_by_first_name: 'Michael',
                    requested_by_last_name: 'Chen',
                    created_at: new Date(Date.now() - 259200000).toISOString()
                }
            ];
            // Filter mock data based on role
            let filteredBookings = mockBookings;
            if (user.role === 'client') {
                filteredBookings = mockBookings.filter((b)=>b.business_id === user.business_id);
            } else if (user.role === 'staff' || user.role === 'supervisor') {
                // Staff see assigned jobs
                filteredBookings = mockBookings.slice(0, 2);
            }
            if (status && status !== 'all') {
                filteredBookings = filteredBookings.filter((b)=>b.status === status);
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                bookings: filteredBookings
            });
        }
        let bookings;
        if (user.role === 'admin') {
            // Admin sees all bookings
            if (status && business_id) {
                bookings = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          WHERE b.status = ${status} AND b.business_id = ${business_id}
          ORDER BY b.created_at DESC
          LIMIT 100
        `;
            } else if (status) {
                bookings = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          WHERE b.status = ${status}
          ORDER BY b.created_at DESC
          LIMIT 100
        `;
            } else if (business_id) {
                bookings = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          WHERE b.business_id = ${business_id}
          ORDER BY b.created_at DESC
          LIMIT 100
        `;
            } else {
                bookings = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          ORDER BY b.created_at DESC
          LIMIT 100
        `;
            }
        } else if (user.role === 'client') {
            // Clients see only their business bookings
            if (status) {
                bookings = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          WHERE b.business_id = ${user.business_id} AND b.status = ${status}
          ORDER BY b.created_at DESC
        `;
            } else {
                bookings = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            u.email as requested_by_email,
            u.first_name as requested_by_first_name,
            u.last_name as requested_by_last_name
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN users u ON b.requested_by = u.id
          WHERE b.business_id = ${user.business_id}
          ORDER BY b.created_at DESC
        `;
            }
        } else if (user.role === 'staff' || user.role === 'supervisor') {
            // Staff/supervisor see assigned jobs
            if (status) {
                bookings = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT DISTINCT
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            sa.status as assignment_status,
            sa.assigned_at
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN staff_assignments sa ON b.id = sa.booking_id
          WHERE (sa.staff_id = ${user.id} OR sa.supervisor_id = ${user.id}) AND b.status = ${status}
          ORDER BY b.scheduled_start DESC, b.created_at DESC
        `;
            } else {
                bookings = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT DISTINCT
            b.*,
            bs.name as business_name,
            s.name as service_name,
            s.type as service_type,
            sa.status as assignment_status,
            sa.assigned_at
          FROM bookings b
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN services s ON b.service_id = s.id
          LEFT JOIN staff_assignments sa ON b.id = sa.booking_id
          WHERE sa.staff_id = ${user.id} OR sa.supervisor_id = ${user.id}
          ORDER BY b.scheduled_start DESC, b.created_at DESC
        `;
            }
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 403
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch bookings'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const authResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authenticate"])(request);
        if (authResult.error) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: authResult.error
            }, {
                status: authResult.status
            });
        }
        const { user } = authResult;
        if (user.role !== 'client') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Only clients can create bookings'
            }, {
                status: 403
            });
        }
        const body = await request.json();
        const { service_id, urgency = 'routine', scheduled_start, scheduled_end, location_address, special_instructions, total_cost } = body;
        if (!service_id || !location_address) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Service ID and location address are required'
            }, {
                status: 400
            });
        }
        // Verify service exists
        const [service] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
      SELECT * FROM services WHERE id = ${service_id} AND is_active = true
    `;
        if (!service) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Service not found or inactive'
            }, {
                status: 404
            });
        }
        // Calculate cost if not provided
        let finalCost = total_cost || service.base_price;
        if (urgency === 'urgent') {
            finalCost = finalCost * 1.5; // 50% premium
        } else if (urgency === 'emergency') {
            finalCost = finalCost * 2; // 100% premium
        }
        // Create booking
        const [booking] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
      INSERT INTO bookings (
        business_id, service_id, requested_by, urgency, 
        scheduled_start, scheduled_end, location_address, 
        special_instructions, total_cost, status
      )
      VALUES (
        ${user.business_id},
        ${service_id},
        ${user.id},
        ${urgency},
        ${scheduled_start || null},
        ${scheduled_end || null},
        ${location_address},
        ${special_instructions || null},
        ${finalCost},
        ${urgency === 'emergency' ? 'pending' : 'pending'}
      )
      RETURNING *
    `;
        // Get full booking details
        const [fullBooking] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
      SELECT 
        b.*,
        bs.name as business_name,
        s.name as service_name,
        s.type as service_type,
        u.email as requested_by_email
      FROM bookings b
      LEFT JOIN businesses bs ON b.business_id = bs.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.requested_by = u.id
      WHERE b.id = ${booking.id}
    `;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            booking: fullBooking
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Create booking error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create booking'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9fafba32._.js.map