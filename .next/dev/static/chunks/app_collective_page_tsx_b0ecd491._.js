(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/collective/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WhatWeDoPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_sliced_to_array.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_to_consumable_array.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
;
;
;
var _this = ("TURBOPACK compile-time value", void 0);
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
/* ─── Animated Counter ───────────────────────────────────────────── */ function AnimatedCounter(param) {
    var target = param.target, _param_suffix = param.suffix, suffix = _param_suffix === void 0 ? '' : _param_suffix;
    _s();
    var _useState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0), 2), count = _useState[0], setCount = _useState[1];
    var ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    var inView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AnimatedCounter.useEffect": function() {
            if (!inView) return;
            var v = 0;
            var step = target / (1600 / 16);
            var t = setInterval({
                "AnimatedCounter.useEffect.t": function() {
                    v += step;
                    if (v >= target) {
                        setCount(target);
                        clearInterval(t);
                    } else setCount(v);
                }
            }["AnimatedCounter.useEffect.t"], 16);
            return ({
                "AnimatedCounter.useEffect": function() {
                    return clearInterval(t);
                }
            })["AnimatedCounter.useEffect"];
        }
    }["AnimatedCounter.useEffect"], [
        inView,
        target
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        ref: ref,
        children: [
            Math.round(count),
            suffix
        ]
    }, void 0, true, {
        fileName: "[project]/app/collective/page.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
_s(AnimatedCounter, "Ness7Bk+ak2NO8b+kFuWz5Za+RQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"]
    ];
});
_c = AnimatedCounter;
/* ─── Sparkline ──────────────────────────────────────────────────── */ function Sparkline(param) {
    var data = param.data, _param_color = param.color, color = _param_color === void 0 ? '#b91c1c' : _param_color, _param_w = param.w, w = _param_w === void 0 ? 80 : _param_w, _param_h = param.h, h = _param_h === void 0 ? 28 : _param_h;
    var _Math, _Math1;
    _s1();
    var ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    var inView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true
    });
    var max = (_Math = Math).max.apply(_Math, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(data));
    var min = (_Math1 = Math).min.apply(_Math1, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(data));
    var pts = data.map(function(v, i) {
        var x = i / (data.length - 1) * w;
        var y = h - (v - min) / (max - min || 1) * h;
        return "".concat(x, ",").concat(y);
    }).join(' ');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        ref: ref,
        width: w,
        height: h,
        viewBox: "0 0 ".concat(w, " ").concat(h),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].polyline, {
            points: pts,
            fill: "none",
            stroke: color,
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            initial: {
                pathLength: 0,
                opacity: 0
            },
            animate: inView ? {
                pathLength: 1,
                opacity: 1
            } : {},
            transition: {
                duration: 1.3,
                ease: 'easeOut'
            }
        }, void 0, false, {
            fileName: "[project]/app/collective/page.tsx",
            lineNumber: 41,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/collective/page.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_s1(Sparkline, "O7qYEn3iCrBBWRAefWku+E/MdDM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"]
    ];
});
_c1 = Sparkline;
/* ─── Animated bar ───────────────────────────────────────────────── */ function MetricBar(param) {
    var pct = param.pct, label = param.label, _param_delay = param.delay, delay = _param_delay === void 0 ? 0 : _param_delay, _param_dark = param.dark, dark = _param_dark === void 0 ? false : _param_dark;
    _s2();
    var ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    var inView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: "space-y-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] uppercase tracking-widest ".concat(dark ? 'text-zinc-500' : 'text-zinc-400'),
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/app/collective/page.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] font-black text-red-600",
                        children: [
                            pct,
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/collective/page.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-1 w-full rounded-full ".concat(dark ? 'bg-zinc-800' : 'bg-zinc-100'),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: "h-1 rounded-full bg-red-700",
                    initial: {
                        width: 0
                    },
                    animate: inView ? {
                        width: "".concat(pct, "%")
                    } : {},
                    transition: {
                        duration: 1,
                        ease: 'easeOut',
                        delay: delay
                    }
                }, void 0, false, {
                    fileName: "[project]/app/collective/page.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/collective/page.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s2(MetricBar, "O7qYEn3iCrBBWRAefWku+E/MdDM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"]
    ];
});
_c2 = MetricBar;
/* ─── SVG illustrations (inline, no external fetch) ─────────────── */ // Revenue Audit — abstract magnifying lens over a bar chart
var AuditIllustration = function() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "100%",
        height: "100%",
        viewBox: "0 0 140 100",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "10",
                y: "60",
                width: "14",
                height: "32",
                fill: "#27272a",
                rx: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 82,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "30",
                y: "44",
                width: "14",
                height: "48",
                fill: "#3f3f46",
                rx: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 83,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "50",
                y: "28",
                width: "14",
                height: "64",
                fill: "#52525b",
                rx: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 84,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "70",
                y: "14",
                width: "14",
                height: "78",
                fill: "#b91c1c",
                opacity: "0.8",
                rx: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 85,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                points: "17,60 37,44 57,28 77,14",
                stroke: "#b91c1c",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 87,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "110",
                cy: "38",
                r: "22",
                stroke: "#71717a",
                strokeWidth: "3",
                fill: "none"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 89,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "110",
                cy: "38",
                r: "14",
                stroke: "#b91c1c",
                strokeWidth: "1.5",
                fill: "rgba(185,28,28,0.06)"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 90,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "127",
                y1: "55",
                x2: "138",
                y2: "66",
                stroke: "#71717a",
                strokeWidth: "3",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 91,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "100",
                y1: "42",
                x2: "120",
                y2: "42",
                stroke: "#3f3f46",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 93,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "103",
                y1: "36",
                x2: "117",
                y2: "36",
                stroke: "#b91c1c",
                strokeWidth: "1.5",
                strokeLinecap: "round"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 94,
                columnNumber: 5
            }, _this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/collective/page.tsx",
        lineNumber: 80,
        columnNumber: 3
    }, _this);
};
_c3 = AuditIllustration;
// Pipeline Management — funnel shape with flow dots
var PipelineIllustration = function() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "100%",
        height: "100%",
        viewBox: "0 0 140 100",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "10",
                y: "12",
                width: "120",
                height: "16",
                fill: "#3f3f46",
                rx: "2"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 102,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "22",
                y: "34",
                width: "96",
                height: "14",
                fill: "#52525b",
                rx: "2"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 103,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "36",
                y: "54",
                width: "68",
                height: "13",
                fill: "#71717a",
                rx: "2"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 104,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "50",
                y: "73",
                width: "40",
                height: "12",
                fill: "#b91c1c",
                opacity: "0.9",
                rx: "2"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 105,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "70",
                y: "24",
                textAnchor: "middle",
                fill: "#a1a1aa",
                fontSize: "7",
                fontWeight: "600",
                children: "LEADS"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 107,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "70",
                y: "45",
                textAnchor: "middle",
                fill: "#a1a1aa",
                fontSize: "7",
                fontWeight: "600",
                children: "QUALIFIED"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 108,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "70",
                y: "64",
                textAnchor: "middle",
                fill: "#d4d4d8",
                fontSize: "7",
                fontWeight: "600",
                children: "ENGAGED"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 109,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "70",
                y: "83",
                textAnchor: "middle",
                fill: "white",
                fontSize: "7",
                fontWeight: "700",
                children: "CLOSED"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 110,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "138",
                cy: "20",
                r: "3",
                fill: "#b91c1c",
                opacity: "0.6"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 112,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "138",
                cy: "41",
                r: "3",
                fill: "#b91c1c",
                opacity: "0.8"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 113,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "138",
                cy: "61",
                r: "3",
                fill: "#b91c1c"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 114,
                columnNumber: 5
            }, _this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/collective/page.tsx",
        lineNumber: 100,
        columnNumber: 3
    }, _this);
};
_c4 = PipelineIllustration;
// Sales Architecture — blueprint grid with nodes
var ArchitectureIllustration = function() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "100%",
        height: "100%",
        viewBox: "0 0 140 100",
        fill: "none",
        children: [
            [
                0,
                20,
                40,
                60,
                80,
                100
            ].map(function(x) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: x + 10,
                    y1: "8",
                    x2: x + 10,
                    y2: "92",
                    stroke: "#27272a",
                    strokeWidth: "0.5"
                }, "v".concat(x), false, {
                    fileName: "[project]/app/collective/page.tsx",
                    lineNumber: 123,
                    columnNumber: 7
                }, _this);
            }),
            [
                0,
                20,
                40,
                60,
                80
            ].map(function(y) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: "10",
                    y1: y + 8,
                    x2: "130",
                    y2: y + 8,
                    stroke: "#27272a",
                    strokeWidth: "0.5"
                }, "h".concat(y), false, {
                    fileName: "[project]/app/collective/page.tsx",
                    lineNumber: 126,
                    columnNumber: 7
                }, _this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "30",
                cy: "28",
                r: "7",
                fill: "#b91c1c"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 129,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "70",
                cy: "48",
                r: "7",
                fill: "#3f3f46",
                stroke: "#b91c1c",
                strokeWidth: "1.5"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 130,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "110",
                cy: "28",
                r: "7",
                fill: "#3f3f46",
                stroke: "#71717a",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 131,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "50",
                cy: "72",
                r: "7",
                fill: "#3f3f46",
                stroke: "#71717a",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 132,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "90",
                cy: "72",
                r: "7",
                fill: "#3f3f46",
                stroke: "#b91c1c",
                strokeWidth: "1.5"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 133,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "37",
                y1: "28",
                x2: "63",
                y2: "44",
                stroke: "#b91c1c",
                strokeWidth: "1.5"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 135,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "77",
                y1: "44",
                x2: "103",
                y2: "28",
                stroke: "#52525b",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 136,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "63",
                y1: "53",
                x2: "55",
                y2: "66",
                stroke: "#52525b",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 137,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "77",
                y1: "53",
                x2: "85",
                y2: "66",
                stroke: "#b91c1c",
                strokeWidth: "1.5"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 138,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "30",
                y: "31",
                textAnchor: "middle",
                fill: "white",
                fontSize: "6",
                fontWeight: "700",
                children: "ICP"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 140,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "70",
                y: "51",
                textAnchor: "middle",
                fill: "white",
                fontSize: "6",
                fontWeight: "700",
                children: "CRM"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 141,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "110",
                y: "31",
                textAnchor: "middle",
                fill: "#a1a1aa",
                fontSize: "6",
                children: "PLAY"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 142,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "50",
                y: "75",
                textAnchor: "middle",
                fill: "#a1a1aa",
                fontSize: "6",
                children: "SCRIPT"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 143,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "90",
                y: "75",
                textAnchor: "middle",
                fill: "white",
                fontSize: "6",
                fontWeight: "700",
                children: "CLOSE"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 144,
                columnNumber: 5
            }, _this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/collective/page.tsx",
        lineNumber: 120,
        columnNumber: 3
    }, _this);
};
_c5 = ArchitectureIllustration;
// Strategic Insights — data radar / target
var InsightsIllustration = function() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "100%",
        height: "100%",
        viewBox: "0 0 140 100",
        fill: "none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "70",
                cy: "50",
                r: "42",
                stroke: "#27272a",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 152,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "70",
                cy: "50",
                r: "30",
                stroke: "#3f3f46",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 153,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "70",
                cy: "50",
                r: "18",
                stroke: "#52525b",
                strokeWidth: "1"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 154,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "70",
                cy: "50",
                r: "7",
                fill: "#b91c1c"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 155,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "70",
                y1: "8",
                x2: "70",
                y2: "92",
                stroke: "#3f3f46",
                strokeWidth: "0.75"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 157,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "28",
                y1: "50",
                x2: "112",
                y2: "50",
                stroke: "#3f3f46",
                strokeWidth: "0.75"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 158,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "90",
                cy: "25",
                r: "4",
                fill: "#b91c1c",
                opacity: "0.9"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 160,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "48",
                cy: "38",
                r: "3",
                fill: "#71717a"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 161,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "102",
                cy: "62",
                r: "3.5",
                fill: "#b91c1c",
                opacity: "0.6"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 162,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "55",
                cy: "70",
                r: "3",
                fill: "#71717a"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 163,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M 95 18 A 40 40 0 0 1 115 58",
                stroke: "#b91c1c",
                strokeWidth: "1.5",
                fill: "none",
                strokeDasharray: "3 3"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 165,
                columnNumber: 5
            }, _this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "92",
                y: "20",
                fill: "#b91c1c",
                fontSize: "6",
                fontWeight: "700",
                children: "HIGH VALUE"
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 167,
                columnNumber: 5
            }, _this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/collective/page.tsx",
        lineNumber: 150,
        columnNumber: 3
    }, _this);
};
_c6 = InsightsIllustration;
/* ─── Services data ──────────────────────────────────────────────── */ var services = [
    {
        num: '01',
        name: 'Revenue Audit',
        tagline: 'Know exactly where revenue is leaking.',
        description: 'A structured, data-led assessment of your entire sales operation — pipeline health, conversion rates, CRM integrity, and competitive positioning. In 5 business days, we hand you the ledger no consultant has shown you.',
        deliverables: [
            'Pipeline health scorecard',
            'Revenue gap analysis',
            'Priority action roadmap'
        ],
        metric: '5',
        metricSuffix: 'd',
        metricLabel: 'delivery time',
        metric2: '100',
        metricSuffix2: '%',
        metricLabel2: 'clients proceed to engagement',
        spark: [
            20,
            35,
            55,
            80,
            100
        ],
        bars: [
            {
                label: 'Pipeline visibility gained',
                pct: 94
            },
            {
                label: 'Revenue gaps surfaced',
                pct: 87
            }
        ],
        Illustration: AuditIllustration,
        bg: 'bg-zinc-900',
        textColor: 'text-white',
        descColor: 'text-zinc-400',
        accent: 'text-red-500',
        border: 'border-zinc-800',
        dark: true
    },
    {
        num: '02',
        name: 'Pipeline Management',
        tagline: 'Full-cycle sales execution. Around the clock.',
        description: 'We become your managed sales function — handling outreach, follow-up, objection resolution, and closing coordination on a 24-hour cycle. No lead goes cold. No opportunity goes missed.',
        deliverables: [
            '24/7 outreach & follow-up',
            'Objection handling & deal acceleration',
            'Weekly pipeline reports & reviews'
        ],
        metric: '340',
        metricSuffix: '%',
        metricLabel: 'avg velocity uplift',
        metric2: '95',
        metricSuffix2: '%',
        metricLabel2: 'lead follow-up rate',
        spark: [
            15,
            40,
            80,
            150,
            240,
            340
        ],
        bars: [
            {
                label: 'Follow-up consistency',
                pct: 95
            },
            {
                label: 'Pipeline conversion',
                pct: 72
            }
        ],
        Illustration: PipelineIllustration,
        bg: 'bg-white',
        textColor: 'text-zinc-900',
        descColor: 'text-zinc-500',
        accent: 'text-red-700',
        border: 'border-zinc-100',
        dark: false
    },
    {
        num: '03',
        name: 'Sales Architecture',
        tagline: 'Build the machine that sells without you.',
        description: 'We design and build your complete sales infrastructure — CRM configuration, multi-touch cadence architecture, team playbooks, and lead scoring models — engineered for velocity and repeatability.',
        deliverables: [
            'CRM setup & workflow automation',
            'Sales scripts & cadence design',
            'Team playbook & accountability framework'
        ],
        metric: '14',
        metricSuffix: 'd',
        metricLabel: 'avg time to launch',
        metric2: '92',
        metricSuffix2: '%',
        metricLabel2: 'CRM automation rate',
        spark: [
            10,
            25,
            45,
            65,
            82,
            92
        ],
        bars: [
            {
                label: 'Process repeatability',
                pct: 92
            },
            {
                label: 'Team adoption rate',
                pct: 88
            }
        ],
        Illustration: ArchitectureIllustration,
        bg: 'bg-zinc-900',
        textColor: 'text-white',
        descColor: 'text-zinc-400',
        accent: 'text-red-500',
        border: 'border-zinc-800',
        dark: true
    },
    {
        num: '04',
        name: 'Strategic Insights',
        tagline: 'See the market before your competitors do.',
        description: 'We surface the intelligence that drives the right conversations — ICP mapping, account scoring, competitive positioning, and pipeline signal monitoring. Stop guessing. Start targeting.',
        deliverables: [
            'Ideal Customer Profile (ICP) mapping',
            'Account scoring & prioritisation',
            'Competitive landscape intelligence'
        ],
        metric: '3.4',
        metricSuffix: '×',
        metricLabel: 'more opportunities surfaced',
        metric2: '87',
        metricSuffix2: '%',
        metricLabel2: 'ICP match rate',
        spark: [
            20,
            38,
            55,
            70,
            82,
            87
        ],
        bars: [
            {
                label: 'Signal-to-close accuracy',
                pct: 84
            },
            {
                label: 'Account targeting precision',
                pct: 87
            }
        ],
        Illustration: InsightsIllustration,
        bg: 'bg-white',
        textColor: 'text-zinc-900',
        descColor: 'text-zinc-500',
        accent: 'text-red-700',
        border: 'border-zinc-100',
        dark: false
    }
];
/* ─── FAQ data ───────────────────────────────────────────────────── */ var faqs = [
    {
        q: 'Do you replace our sales team?',
        a: 'No. We augment or manage alongside your existing people. We handle the systematic layer — outreach, CRM, cadence, reporting — so your team can focus on high-value human closes.'
    },
    {
        q: 'How quickly do results appear?',
        a: 'Pipeline improvements typically show within 30–45 days of engagement. Revenue closes follow at 60–90 days depending on your cycle length. Our fastest client saw a close in week three.'
    },
    {
        q: 'What size of business is this for?',
        a: 'We work with B2B companies generating ₦300K–₦10M in annual revenue who are ready to move from ad hoc sales to a managed, structured approach.'
    },
    {
        q: 'Is there a minimum commitment?',
        a: 'The Revenue Audit is a standalone engagement. Retained management requires a 3-month minimum — enough time for the full Insights → Planning → Execution cycle to mature.'
    },
    {
        q: 'How do you measure success?',
        a: 'Pipeline velocity, close rate, average deal size, and cycle length. We establish baseline metrics in week one and report against them every week. You see every number.'
    }
];
/* ─── FAQ Accordion ──────────────────────────────────────────────── */ function FaqItem(param) {
    var q = param.q, a = param.a, idx = param.idx;
    _s3();
    var _useState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), open = _useState[0], setOpen = _useState[1];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 10
        },
        whileInView: {
            opacity: 1,
            y: 0
        },
        viewport: {
            once: true
        },
        transition: {
            delay: idx * 0.06
        },
        className: "border-b border-zinc-100",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: function() {
                    return setOpen(!open);
                },
                className: "w-full flex items-center justify-between py-5 text-left gap-4 group",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-bold text-zinc-900 group-hover:text-red-700 transition-colors",
                        children: q
                    }, void 0, false, {
                        fileName: "[project]/app/collective/page.tsx",
                        lineNumber: 286,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        size: 16,
                        className: "flex-shrink-0 text-zinc-400 transition-transform duration-300 ".concat(open ? 'rotate-180 text-red-700' : '')
                    }, void 0, false, {
                        fileName: "[project]/app/collective/page.tsx",
                        lineNumber: 287,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 282,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: false,
                animate: {
                    height: open ? 'auto' : 0,
                    opacity: open ? 1 : 0
                },
                transition: {
                    duration: 0.25
                },
                className: "overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-zinc-500 leading-relaxed pb-5",
                    children: a
                }, void 0, false, {
                    fileName: "[project]/app/collective/page.tsx",
                    lineNumber: 298,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 292,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/collective/page.tsx",
        lineNumber: 275,
        columnNumber: 5
    }, this);
}
_s3(FaqItem, "xG1TONbKtDWtdOTrXaTAsNhPg/Q=");
_c7 = FaqItem;
function WhatWeDoPage() {
    var _this = this;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-white overflow-x-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "pt-32 pb-16 px-6 bg-zinc-900 relative overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none",
                        xmlns: "http://www.w3.org/2000/svg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pattern", {
                                    id: "grid",
                                    width: "40",
                                    height: "40",
                                    patternUnits: "userSpaceOnUse",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M 40 0 L 0 0 0 40",
                                        fill: "none",
                                        stroke: "white",
                                        strokeWidth: "0.5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/collective/page.tsx",
                                        lineNumber: 315,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 314,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/collective/page.tsx",
                                lineNumber: 313,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                width: "100%",
                                height: "100%",
                                fill: "url(#grid)"
                            }, void 0, false, {
                                fileName: "[project]/app/collective/page.tsx",
                                lineNumber: 318,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/collective/page.tsx",
                        lineNumber: 312,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-6xl mx-auto relative z-10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid lg:grid-cols-2 gap-12 items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 24
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    transition: {
                                        duration: 0.6
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inline-flex items-center gap-2 px-3 py-1.5 bg-red-700 text-white text-[10px] font-semibold uppercase tracking-widest mb-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-1.5 h-1.5 bg-white rounded-full animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 329,
                                                    columnNumber: 17
                                                }, this),
                                                "Services"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 328,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.88] text-white mb-6",
                                            children: [
                                                "What We",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 333,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-red-500 italic",
                                                    children: "Do."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 334,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 332,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-base md:text-lg text-zinc-400 leading-relaxed max-w-lg mb-8",
                                            children: "Four managed services. One outcome — a revenue engine that runs without you having to push it."
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 336,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/briefing",
                                                    className: "inline-flex items-center gap-2 px-7 py-3.5 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors group",
                                                    children: [
                                                        "Start with an Audit",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                            size: 15,
                                                            className: "group-hover:translate-x-0.5 transition-transform"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/collective/page.tsx",
                                                            lineNumber: 342,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 340,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/performance",
                                                    className: "inline-flex items-center gap-2 px-7 py-3.5 border border-zinc-700 text-zinc-300 text-sm font-semibold uppercase tracking-wider hover:border-zinc-400 hover:text-white transition-colors",
                                                    children: "See Results"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 344,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 339,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 323,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        x: 30
                                    },
                                    animate: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    transition: {
                                        duration: 0.7,
                                        delay: 0.2
                                    },
                                    className: "hidden lg:flex flex-col gap-4",
                                    children: [
                                        {
                                            val: 4,
                                            suffix: '',
                                            label: 'Core services',
                                            sub: 'Audit → Architecture → Pipeline → Intelligence'
                                        },
                                        {
                                            val: 47,
                                            suffix: '+',
                                            label: 'Active managed clients',
                                            sub: '6 industries, 3 continents'
                                        },
                                        {
                                            val: 340,
                                            suffix: '%',
                                            label: 'Avg pipeline velocity uplift',
                                            sub: 'Across managed engagements'
                                        }
                                    ].map(function(s, i) {
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                opacity: 0,
                                                x: 20
                                            },
                                            animate: {
                                                opacity: 1,
                                                x: 0
                                            },
                                            transition: {
                                                delay: 0.3 + i * 0.1
                                            },
                                            className: "bg-zinc-800/60 border border-zinc-800 px-6 py-5 flex items-center justify-between gap-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-3xl font-black text-red-500 leading-none",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AnimatedCounter, {
                                                                target: s.val,
                                                                suffix: s.suffix
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/collective/page.tsx",
                                                                lineNumber: 371,
                                                                columnNumber: 23
                                                            }, _this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/collective/page.tsx",
                                                            lineNumber: 370,
                                                            columnNumber: 21
                                                        }, _this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] font-semibold uppercase tracking-widest text-zinc-300 mt-1",
                                                            children: s.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/collective/page.tsx",
                                                            lineNumber: 373,
                                                            columnNumber: 21
                                                        }, _this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[9px] text-zinc-600 mt-0.5",
                                                            children: s.sub
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/collective/page.tsx",
                                                            lineNumber: 374,
                                                            columnNumber: 21
                                                        }, _this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 369,
                                                    columnNumber: 19
                                                }, _this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Sparkline, {
                                                    data: i === 0 ? [
                                                        1,
                                                        2,
                                                        3,
                                                        4
                                                    ] : i === 1 ? [
                                                        20,
                                                        28,
                                                        35,
                                                        40,
                                                        47
                                                    ] : [
                                                        30,
                                                        80,
                                                        160,
                                                        240,
                                                        340
                                                    ],
                                                    color: "#ef4444",
                                                    w: 80,
                                                    h: 30
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 376,
                                                    columnNumber: 19
                                                }, _this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 362,
                                            columnNumber: 17
                                        }, _this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 351,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/collective/page.tsx",
                            lineNumber: 322,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/collective/page.tsx",
                        lineNumber: 321,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 310,
                columnNumber: 7
            }, this),
            services.map(function(svc, idx) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "py-16 px-6 ".concat(svc.bg, " border-b ").concat(svc.border),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-6xl mx-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid lg:grid-cols-2 gap-12 items-start ".concat(idx % 2 === 1 ? 'lg:grid-flow-dense' : ''),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        x: idx % 2 === 1 ? 20 : -20
                                    },
                                    whileInView: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    viewport: {
                                        once: true
                                    },
                                    transition: {
                                        duration: 0.6
                                    },
                                    className: "space-y-6 ".concat(idx % 2 === 1 ? 'lg:col-start-2' : ''),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] font-semibold uppercase tracking-widest ".concat(svc.accent, " mb-1"),
                                                    children: [
                                                        svc.num,
                                                        " — Service"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 402,
                                                    columnNumber: 19
                                                }, _this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-3xl md:text-4xl font-black tracking-tighter ".concat(svc.textColor, " leading-tight mb-1"),
                                                    children: svc.name
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 405,
                                                    columnNumber: 19
                                                }, _this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm italic ".concat(svc.descColor),
                                                    children: svc.tagline
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 408,
                                                    columnNumber: 19
                                                }, _this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 401,
                                            columnNumber: 17
                                        }, _this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm leading-relaxed ".concat(svc.descColor),
                                            children: svc.description
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 411,
                                            columnNumber: 17
                                        }, _this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[9px] font-semibold uppercase tracking-widest mb-3 ".concat(svc.descColor),
                                                    children: "Deliverables"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 415,
                                                    columnNumber: 19
                                                }, _this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    className: "space-y-2",
                                                    children: svc.deliverables.map(function(d, dIdx) {
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            className: "flex items-center gap-3 text-sm ".concat(svc.dark ? 'text-zinc-300' : 'text-zinc-600'),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-1 h-1 rounded-full bg-red-700 flex-shrink-0"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/collective/page.tsx",
                                                                    lineNumber: 419,
                                                                    columnNumber: 25
                                                                }, _this),
                                                                d
                                                            ]
                                                        }, dIdx, true, {
                                                            fileName: "[project]/app/collective/page.tsx",
                                                            lineNumber: 418,
                                                            columnNumber: 23
                                                        }, _this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 416,
                                                    columnNumber: 19
                                                }, _this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 17
                                        }, _this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3 border-t pt-5 ".concat(svc.dark ? 'border-zinc-800' : 'border-zinc-100'),
                                            children: svc.bars.map(function(bar, bIdx) {
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricBar, {
                                                    label: bar.label,
                                                    pct: bar.pct,
                                                    delay: bIdx * 0.12,
                                                    dark: svc.dark
                                                }, bIdx, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 429,
                                                    columnNumber: 21
                                                }, _this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 427,
                                            columnNumber: 17
                                        }, _this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/briefing",
                                            className: "inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-500 transition-colors group",
                                            children: [
                                                "Start with this service ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                    size: 13,
                                                    className: "group-hover:translate-x-0.5 transition-transform"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 437,
                                                    columnNumber: 43
                                                }, _this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 433,
                                            columnNumber: 17
                                        }, _this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 394,
                                    columnNumber: 15
                                }, _this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        x: idx % 2 === 1 ? -20 : 20
                                    },
                                    whileInView: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    viewport: {
                                        once: true
                                    },
                                    transition: {
                                        duration: 0.6
                                    },
                                    className: idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : '',
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border ".concat(svc.border, " p-6 space-y-5"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-full h-28 ".concat(svc.dark ? 'bg-zinc-800' : 'bg-zinc-50', " flex items-center justify-center"),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-full h-full p-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(svc.Illustration, {}, void 0, false, {
                                                        fileName: "[project]/app/collective/page.tsx",
                                                        lineNumber: 454,
                                                        columnNumber: 23
                                                    }, _this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 453,
                                                    columnNumber: 21
                                                }, _this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/collective/page.tsx",
                                                lineNumber: 452,
                                                columnNumber: 19
                                            }, _this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-4 border ".concat(svc.dark ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-100 bg-zinc-50'),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-2xl font-black leading-none ".concat(svc.accent),
                                                                children: [
                                                                    svc.metric,
                                                                    svc.metricSuffix
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/collective/page.tsx",
                                                                lineNumber: 461,
                                                                columnNumber: 23
                                                            }, _this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[9px] uppercase tracking-widest mt-1 ".concat(svc.descColor),
                                                                children: svc.metricLabel
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/collective/page.tsx",
                                                                lineNumber: 464,
                                                                columnNumber: 23
                                                            }, _this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/collective/page.tsx",
                                                        lineNumber: 460,
                                                        columnNumber: 21
                                                    }, _this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-4 border ".concat(svc.dark ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-100 bg-zinc-50'),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-2xl font-black leading-none ".concat(svc.accent),
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AnimatedCounter, {
                                                                    target: parseFloat(svc.metric2),
                                                                    suffix: svc.metricSuffix2
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/collective/page.tsx",
                                                                    lineNumber: 468,
                                                                    columnNumber: 25
                                                                }, _this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/collective/page.tsx",
                                                                lineNumber: 467,
                                                                columnNumber: 23
                                                            }, _this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[9px] uppercase tracking-widest mt-1 ".concat(svc.descColor),
                                                                children: svc.metricLabel2
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/collective/page.tsx",
                                                                lineNumber: 470,
                                                                columnNumber: 23
                                                            }, _this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/collective/page.tsx",
                                                        lineNumber: 466,
                                                        columnNumber: 21
                                                    }, _this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/collective/page.tsx",
                                                lineNumber: 459,
                                                columnNumber: 19
                                            }, _this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "border-t pt-4 flex items-center justify-between ".concat(svc.dark ? 'border-zinc-800' : 'border-zinc-100'),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[9px] uppercase tracking-widest ".concat(svc.descColor),
                                                        children: "Performance trend"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/collective/page.tsx",
                                                        lineNumber: 476,
                                                        columnNumber: 21
                                                    }, _this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Sparkline, {
                                                        data: svc.spark,
                                                        color: svc.dark ? '#ef4444' : '#b91c1c',
                                                        w: 100,
                                                        h: 28
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/collective/page.tsx",
                                                        lineNumber: 477,
                                                        columnNumber: 21
                                                    }, _this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/collective/page.tsx",
                                                lineNumber: 475,
                                                columnNumber: 19
                                            }, _this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/collective/page.tsx",
                                        lineNumber: 450,
                                        columnNumber: 17
                                    }, _this)
                                }, void 0, false, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 442,
                                    columnNumber: 15
                                }, _this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/collective/page.tsx",
                            lineNumber: 391,
                            columnNumber: 13
                        }, _this)
                    }, void 0, false, {
                        fileName: "[project]/app/collective/page.tsx",
                        lineNumber: 390,
                        columnNumber: 11
                    }, _this)
                }, idx, false, {
                    fileName: "[project]/app/collective/page.tsx",
                    lineNumber: 389,
                    columnNumber: 9
                }, _this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-16 px-6 bg-zinc-900",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-6xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-10 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-2",
                                    children: "Process"
                                }, void 0, false, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 491,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-3xl md:text-4xl font-black tracking-tighter text-white",
                                    children: "How an engagement works."
                                }, void 0, false, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 492,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/collective/page.tsx",
                            lineNumber: 490,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid md:grid-cols-3 gap-0 relative",
                            children: [
                                {
                                    step: '01',
                                    title: 'Revenue Audit',
                                    duration: 'Days 1–5',
                                    desc: 'We assess your full sales operation and deliver a priority roadmap — pipeline gaps, ICP blind spots, and where the money is.',
                                    output: 'Action Roadmap'
                                },
                                {
                                    step: '02',
                                    title: 'Architecture',
                                    duration: 'Days 6–20',
                                    desc: 'We build your sales infrastructure — CRM, cadences, scripts, playbooks — everything needed to launch a managed operation.',
                                    output: 'Sales Blueprint'
                                },
                                {
                                    step: '03',
                                    title: 'Execution',
                                    duration: 'Month 2 onwards',
                                    desc: 'We run the engine. Daily outreach, follow-up, pipeline reviews, and continuous optimisation — while you focus on the business.',
                                    output: 'Closed Revenue'
                                }
                            ].map(function(step, idx) {
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 16
                                    },
                                    whileInView: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    viewport: {
                                        once: true
                                    },
                                    transition: {
                                        delay: idx * 0.12
                                    },
                                    className: "relative border border-zinc-800 p-8 hover:border-red-700/40 transition-colors",
                                    children: [
                                        idx < 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "hidden md:block absolute top-1/2 -right-4 z-10 -translate-y-1/2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                size: 20,
                                                className: "text-red-700"
                                            }, void 0, false, {
                                                fileName: "[project]/app/collective/page.tsx",
                                                lineNumber: 526,
                                                columnNumber: 21
                                            }, _this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 525,
                                            columnNumber: 19
                                        }, _this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1",
                                            children: step.duration
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 529,
                                            columnNumber: 17
                                        }, _this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-5xl font-black text-zinc-800 leading-none mb-4 select-none",
                                            children: step.step
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 530,
                                            columnNumber: 17
                                        }, _this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-black text-white mb-3",
                                            children: step.title
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 531,
                                            columnNumber: 17
                                        }, _this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-zinc-400 leading-relaxed mb-5",
                                            children: step.desc
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 532,
                                            columnNumber: 17
                                        }, _this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border border-red-700/40 px-3 py-2 inline-block",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[9px] font-semibold uppercase tracking-widest text-red-500",
                                                    children: "Output"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 534,
                                                    columnNumber: 19
                                                }, _this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-bold text-white",
                                                    children: step.output
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 535,
                                                    columnNumber: 19
                                                }, _this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 533,
                                            columnNumber: 17
                                        }, _this)
                                    ]
                                }, idx, true, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 515,
                                    columnNumber: 15
                                }, _this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/collective/page.tsx",
                            lineNumber: 497,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/collective/page.tsx",
                    lineNumber: 489,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 488,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-16 px-6 bg-white border-b border-zinc-100",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-6xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-2",
                                    children: "Engagement Models"
                                }, void 0, false, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 547,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-3xl md:text-4xl font-black tracking-tighter text-zinc-900",
                                    children: "Two ways to engage."
                                }, void 0, false, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 548,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/collective/page.tsx",
                            lineNumber: 546,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid md:grid-cols-2 gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 16
                                    },
                                    whileInView: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    viewport: {
                                        once: true
                                    },
                                    transition: {
                                        duration: 0.5
                                    },
                                    className: "border-2 border-zinc-100 p-8 hover:border-red-100 transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-4",
                                            children: "Project-Based"
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 562,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-2xl font-black text-zinc-900 mb-4",
                                            children: "Single Service Engagement"
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 563,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-zinc-500 leading-relaxed mb-6",
                                            children: "Commission one service — typically the Revenue Audit or Sales Architecture build — with a defined scope, timeline, and output. Ideal for firms ready to diagnose before committing to management."
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 564,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-2 mb-6",
                                            children: [
                                                'Fixed scope & price',
                                                'Clear deliverables & timeline',
                                                'No long-term commitment',
                                                'Option to upgrade to retained'
                                            ].map(function(f, i) {
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "flex items-center gap-3 text-sm text-zinc-600",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-1 h-1 rounded-full bg-zinc-400 flex-shrink-0"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/collective/page.tsx",
                                                            lineNumber: 570,
                                                            columnNumber: 21
                                                        }, _this),
                                                        f
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 569,
                                                    columnNumber: 19
                                                }, _this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 567,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/briefing",
                                            className: "inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-red-700 transition-colors group",
                                            children: [
                                                "Start with the Audit ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                    size: 13,
                                                    className: "group-hover:translate-x-0.5 transition-transform"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 576,
                                                    columnNumber: 38
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 575,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 555,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 16
                                    },
                                    whileInView: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    viewport: {
                                        once: true
                                    },
                                    transition: {
                                        duration: 0.5,
                                        delay: 0.1
                                    },
                                    className: "border-2 border-red-700 p-8 bg-zinc-900 relative overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute top-4 right-4 bg-red-700 px-3 py-1",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] font-black uppercase tracking-widest text-white",
                                                children: "Most Popular"
                                            }, void 0, false, {
                                                fileName: "[project]/app/collective/page.tsx",
                                                lineNumber: 589,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 588,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-4",
                                            children: "Retained Management"
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 591,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-2xl font-black text-white mb-4",
                                            children: "Full Managed Service"
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 592,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-zinc-400 leading-relaxed mb-6",
                                            children: "We become your sales management function — running all four services in an integrated, 24-hour cycle. Pricing is tied to performance milestones, not billable hours. You pay for results."
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 593,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-2 mb-6",
                                            children: [
                                                'All four services integrated',
                                                '24/7 pipeline management',
                                                'Weekly performance reporting',
                                                'Performance-linked pricing',
                                                '3-month minimum term'
                                            ].map(function(f, i) {
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "flex items-center gap-3 text-sm text-zinc-300",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-1 h-1 rounded-full bg-red-700 flex-shrink-0"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/collective/page.tsx",
                                                            lineNumber: 599,
                                                            columnNumber: 21
                                                        }, _this),
                                                        f
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 598,
                                                    columnNumber: 19
                                                }, _this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 596,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/briefing",
                                            className: "inline-flex items-center gap-2 px-6 py-3 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors group",
                                            children: [
                                                "Apply for Management",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                    size: 13,
                                                    className: "group-hover:translate-x-0.5 transition-transform"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/collective/page.tsx",
                                                    lineNumber: 609,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/collective/page.tsx",
                                            lineNumber: 604,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 581,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/collective/page.tsx",
                            lineNumber: 553,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/collective/page.tsx",
                    lineNumber: 545,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 544,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-16 px-6 bg-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-3xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-2",
                                    children: "FAQ"
                                }, void 0, false, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 620,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-3xl font-black tracking-tighter text-zinc-900",
                                    children: "Common questions."
                                }, void 0, false, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 621,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/collective/page.tsx",
                            lineNumber: 619,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: faqs.map(function(faq, idx) {
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FaqItem, {
                                    q: faq.q,
                                    a: faq.a,
                                    idx: idx
                                }, idx, false, {
                                    fileName: "[project]/app/collective/page.tsx",
                                    lineNumber: 625,
                                    columnNumber: 15
                                }, _this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/collective/page.tsx",
                            lineNumber: 623,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/collective/page.tsx",
                    lineNumber: 618,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 617,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "bg-red-700 py-16 px-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-6xl mx-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 16
                        },
                        whileInView: {
                            opacity: 1,
                            y: 0
                        },
                        viewport: {
                            once: true
                        },
                        transition: {
                            duration: 0.5
                        },
                        className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-semibold uppercase tracking-widest text-red-300 mb-2",
                                        children: "Ready to start?"
                                    }, void 0, false, {
                                        fileName: "[project]/app/collective/page.tsx",
                                        lineNumber: 642,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl md:text-4xl font-black tracking-tighter text-white mb-2 leading-tight",
                                        children: [
                                            "Every engagement starts",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/app/collective/page.tsx",
                                                lineNumber: 644,
                                                columnNumber: 40
                                            }, this),
                                            "with one audit."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/collective/page.tsx",
                                        lineNumber: 643,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-red-200 text-sm max-w-md",
                                        children: "5 business days. A clear roadmap. No commitment required to proceed."
                                    }, void 0, false, {
                                        fileName: "[project]/app/collective/page.tsx",
                                        lineNumber: 646,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/collective/page.tsx",
                                lineNumber: 641,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/briefing",
                                className: "inline-flex items-center gap-2 px-8 py-4 bg-white text-red-700 text-sm font-black uppercase tracking-wider hover:bg-zinc-100 transition-colors group whitespace-nowrap",
                                children: [
                                    "Request Your Audit",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                        size: 15,
                                        className: "group-hover:translate-x-0.5 transition-transform"
                                    }, void 0, false, {
                                        fileName: "[project]/app/collective/page.tsx",
                                        lineNumber: 655,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/collective/page.tsx",
                                lineNumber: 650,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/collective/page.tsx",
                        lineNumber: 634,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/collective/page.tsx",
                    lineNumber: 633,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/collective/page.tsx",
                lineNumber: 632,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/collective/page.tsx",
        lineNumber: 307,
        columnNumber: 5
    }, this);
}
_c8 = WhatWeDoPage;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "AnimatedCounter");
__turbopack_context__.k.register(_c1, "Sparkline");
__turbopack_context__.k.register(_c2, "MetricBar");
__turbopack_context__.k.register(_c3, "AuditIllustration");
__turbopack_context__.k.register(_c4, "PipelineIllustration");
__turbopack_context__.k.register(_c5, "ArchitectureIllustration");
__turbopack_context__.k.register(_c6, "InsightsIllustration");
__turbopack_context__.k.register(_c7, "FaqItem");
__turbopack_context__.k.register(_c8, "WhatWeDoPage");
if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(globalThis.$RefreshHelpers$) === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_collective_page_tsx_b0ecd491._.js.map