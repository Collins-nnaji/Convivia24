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
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/serverless/index.mjs [app-route] (ecmascript)");
;
;
;
// Models currently allowed for chat (override with OPENAI_CHAT_MODEL env)
const ALLOWED_OPENAI_CHAT_MODELS = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-4o-2024-11-20',
    'gpt-4o-mini-2024-07-18',
    'gpt-3.5-turbo'
];
function getModel() {
    const envModel = process.env.OPENAI_CHAT_MODEL?.trim();
    if (envModel && ALLOWED_OPENAI_CHAT_MODELS.includes(envModel)) {
        return envModel;
    }
    return 'gpt-4o-mini'; // default when OPENAI_CHAT_MODEL is unset or not in allowed list
}
const systemPrompt = `You are a live AI Revenue Advisor for Convivia24. You help visitors with revenue, sales, and pipeline questions. Be concise, professional, and helpful. Collect their name and email when relevant so the team can follow up. Treat this as a live chat: short turns, clear next steps.`;
async function POST(req) {
    try {
        const body = await req.json();
        const { messages = [], inquiryId: providedId, name, email, subject } = body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'messages array required with at least one message'
            }, {
                status: 400
            });
        }
        if (!process.env.OPENAI_API_KEY) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Chat is not configured (missing OPENAI_API_KEY)'
            }, {
                status: 503
            });
        }
        const model = getModel();
        const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
            apiKey: process.env.OPENAI_API_KEY
        });
        const dbUrl = process.env.DATABASE_URL;
        let inquiryId = providedId;
        if (dbUrl) {
            const sql = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["neon"])(dbUrl);
            if (!inquiryId) {
                const rows = await sql`
          INSERT INTO chat_inquiries (name, email, subject, messages, status)
          VALUES (${name ?? null}, ${email ?? null}, ${subject ?? null}, '[]', 'open')
          RETURNING id
        `;
                inquiryId = rows?.[0]?.id ?? null;
            }
        }
        const apiMessages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...messages.map((m)=>({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }))
        ];
        const stream = await openai.chat.completions.create({
            model,
            messages: apiMessages,
            max_tokens: 1024,
            stream: true
        });
        const encoder = new TextEncoder();
        let fullContent = '';
        const readable = new ReadableStream({
            async start (controller) {
                try {
                    for await (const chunk of stream){
                        const text = chunk.choices[0]?.delta?.content;
                        if (text) {
                            fullContent += text;
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    if (dbUrl && inquiryId) {
                        const sql = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["neon"])(dbUrl);
                        const updatedMessages = [
                            ...messages,
                            {
                                role: 'assistant',
                                content: fullContent
                            }
                        ];
                        await sql`
              UPDATE chat_inquiries
              SET messages = ${JSON.stringify(updatedMessages)}::jsonb,
                  "updatedAt" = NOW()
              WHERE id = ${inquiryId}::uuid
            `;
                    }
                    controller.enqueue(encoder.encode(`\n\x00DATA:${JSON.stringify({
                        done: true,
                        inquiryId
                    })}\n`));
                } catch (e) {
                    controller.error(e);
                } finally{
                    controller.close();
                }
            }
        });
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            }
        });
    } catch (err) {
        console.error('Chat API error:', err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err instanceof Error ? err.message : 'Chat request failed'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4e4f28f0._.js.map