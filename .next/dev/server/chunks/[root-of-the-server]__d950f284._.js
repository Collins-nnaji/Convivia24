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
"[project]/app/api/bookings/[id]/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.js [app-route] (ecmascript)");
;
;
;
async function GET(request, { params }) {
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
        const { id } = params;
        // Check if database is available
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]) {
            // Return mock booking data
            const mockBooking = {
                id: id,
                business_id: 'mock-business-1',
                service_id: 'mock-service-1',
                requested_by: user.id,
                status: id.includes('mock-1') ? 'pending' : id.includes('mock-2') ? 'in_progress' : 'completed',
                urgency: 'routine',
                scheduled_start: new Date(Date.now() + 86400000).toISOString(),
                scheduled_end: new Date(Date.now() + 86400000 + 14400000).toISOString(),
                location_address: '123 Main Street, Lagos',
                special_instructions: 'Please use eco-friendly cleaning products',
                total_cost: 15000,
                payment_status: 'pending',
                business_name: 'TechCorp Nigeria',
                business_address: '123 Main Street, Lagos',
                business_phone: '+234 800 000 0000',
                service_name: 'Routine Commercial Cleaning',
                service_type: 'routine',
                service_description: 'Daily/weekly office cleaning including floors, restrooms, and common areas',
                requested_by_email: 'client@techcorp.com',
                requested_by_first_name: 'John',
                requested_by_last_name: 'Doe',
                assignments: [
                    {
                        id: 'mock-assignment-1',
                        staff_id: 'mock-staff-1',
                        staff_first_name: 'James',
                        staff_last_name: 'Wilson',
                        staff_email: 'james@convivia24.com',
                        status: 'assigned',
                        assigned_at: new Date().toISOString()
                    }
                ],
                compliance_logs: id.includes('mock-3') ? [
                    {
                        id: 'mock-log-1',
                        checked_by: 'mock-supervisor-1',
                        checked_by_first_name: 'Supervisor',
                        checked_by_last_name: 'User',
                        checklist_items: [
                            {
                                id: 1,
                                text: 'All floors swept and mopped',
                                completed: true
                            },
                            {
                                id: 2,
                                text: 'Restrooms cleaned and sanitized',
                                completed: true
                            },
                            {
                                id: 3,
                                text: 'Trash bins emptied',
                                completed: true
                            }
                        ],
                        photos: [],
                        sign_off: true,
                        verified_at: new Date(Date.now() - 86400000).toISOString()
                    }
                ] : [],
                invoice: id.includes('mock-3') ? {
                    id: 'mock-invoice-1',
                    invoice_number: 'INV-2024-001',
                    amount: 15000,
                    tax: 1125,
                    total: 16125,
                    status: 'paid',
                    due_date: new Date(Date.now() + 2592000000).toISOString().split('T')[0],
                    paid_at: new Date(Date.now() - 172800000).toISOString()
                } : null,
                created_at: new Date().toISOString()
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                booking: mockBooking
            });
        }
        // Get booking with details
        const [booking] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
      SELECT 
        b.*,
        bs.name as business_name,
        bs.address as business_address,
        bs.phone as business_phone,
        s.name as service_name,
        s.type as service_type,
        s.description as service_description,
        u.email as requested_by_email,
        u.first_name as requested_by_first_name,
        u.last_name as requested_by_last_name
      FROM bookings b
      LEFT JOIN businesses bs ON b.business_id = bs.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.requested_by = u.id
      WHERE b.id = ${id}
    `;
        if (!booking) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Booking not found'
            }, {
                status: 404
            });
        }
        // Check access permissions
        if (user.role === 'client' && booking.business_id !== user.business_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 403
            });
        }
        // Get staff assignments
        const assignments = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
      SELECT 
        sa.*,
        u.email as staff_email,
        u.first_name as staff_first_name,
        u.last_name as staff_last_name,
        sup.email as supervisor_email,
        sup.first_name as supervisor_first_name,
        sup.last_name as supervisor_last_name
      FROM staff_assignments sa
      LEFT JOIN users u ON sa.staff_id = u.id
      LEFT JOIN users sup ON sa.supervisor_id = sup.id
      WHERE sa.booking_id = ${id}
    `;
        // Get compliance logs
        const complianceLogs = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
      SELECT 
        cl.*,
        u.email as checked_by_email,
        u.first_name as checked_by_first_name,
        u.last_name as checked_by_last_name
      FROM compliance_logs cl
      LEFT JOIN users u ON cl.checked_by = u.id
      WHERE cl.booking_id = ${id}
      ORDER BY cl.created_at DESC
    `;
        // Get invoice if exists
        const [invoice] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
      SELECT * FROM invoices WHERE booking_id = ${id}
    `;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            booking: {
                ...booking,
                assignments,
                compliance_logs: complianceLogs,
                invoice
            }
        });
    } catch (error) {
        console.error('Get booking error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch booking'
        }, {
            status: 500
        });
    }
}
async function PATCH(request, { params }) {
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
        const { id } = params;
        const body = await request.json();
        // Get existing booking
        const [existing] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
      SELECT * FROM bookings WHERE id = ${id}
    `;
        if (!existing) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Booking not found'
            }, {
                status: 404
            });
        }
        // Check permissions
        const canEdit = user.role === 'admin' || user.role === 'client' && existing.business_id === user.business_id || user.role === 'staff' && existing.status === 'in_progress';
        if (!canEdit) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized to update this booking'
            }, {
                status: 403
            });
        }
        // Build update query using sql template
        let updated;
        if (body.status !== undefined && body.scheduled_start !== undefined && body.scheduled_end !== undefined) {
            updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        UPDATE bookings
        SET 
          status = ${body.status},
          scheduled_start = ${body.scheduled_start},
          scheduled_end = ${body.scheduled_end},
          special_instructions = ${body.special_instructions || existing.special_instructions},
          location_address = ${body.location_address || existing.location_address},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
        } else if (body.status !== undefined) {
            updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        UPDATE bookings
        SET 
          status = ${body.status},
          special_instructions = ${body.special_instructions !== undefined ? body.special_instructions : existing.special_instructions},
          location_address = ${body.location_address !== undefined ? body.location_address : existing.location_address},
          actual_start = ${body.actual_start !== undefined ? body.actual_start : existing.actual_start},
          actual_end = ${body.actual_end !== undefined ? body.actual_end : existing.actual_end},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
        } else if (body.scheduled_start !== undefined && body.scheduled_end !== undefined) {
            updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        UPDATE bookings
        SET 
          scheduled_start = ${body.scheduled_start},
          scheduled_end = ${body.scheduled_end},
          special_instructions = ${body.special_instructions !== undefined ? body.special_instructions : existing.special_instructions},
          location_address = ${body.location_address !== undefined ? body.location_address : existing.location_address},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
        } else if (body.actual_start !== undefined || body.actual_end !== undefined) {
            updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        UPDATE bookings
        SET 
          actual_start = ${body.actual_start !== undefined ? body.actual_start : existing.actual_start},
          actual_end = ${body.actual_end !== undefined ? body.actual_end : existing.actual_end},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
        } else if (body.special_instructions !== undefined || body.location_address !== undefined) {
            updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        UPDATE bookings
        SET 
          special_instructions = ${body.special_instructions !== undefined ? body.special_instructions : existing.special_instructions},
          location_address = ${body.location_address !== undefined ? body.location_address : existing.location_address},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No fields to update'
            }, {
                status: 400
            });
        }
        if (!updated || updated.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Booking not found or update failed'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            booking: updated[0]
        });
    } catch (error) {
        console.error('Update booking error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to update booking'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d950f284._.js.map