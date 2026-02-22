(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/url-B7VXiggp.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "i",
    ()=>getProtocol,
    "n",
    ()=>getHost,
    "r",
    ()=>getOrigin,
    "t",
    ()=>getBaseURL
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_instanceof$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_instanceof.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env-D6s-lvJz.mjs [app-client] (ecmascript) <export c as env>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error-CMXuwPsa.mjs [app-client] (ecmascript) <export t as BetterAuthError>");
;
;
;
//#region src/utils/url.ts
function checkHasPath(url) {
    try {
        return (new URL(url).pathname.replace(/\/+$/, "") || "/") !== "/";
    } catch (error) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"]("Invalid base URL: ".concat(url, ". Please provide a valid base URL."));
    }
}
function assertHasProtocol(url) {
    try {
        var parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"]("Invalid base URL: ".concat(url, ". URL must include 'http://' or 'https://'"));
    } catch (error) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_instanceof$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(error, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"])) throw error;
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"]("Invalid base URL: ".concat(url, ". Please provide a valid base URL."), String(error));
    }
}
function withPath(url) {
    var path = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "/api/auth";
    assertHasProtocol(url);
    if (checkHasPath(url)) return url;
    var trimmedUrl = url.replace(/\/+$/, "");
    if (!path || path === "/") return trimmedUrl;
    path = path.startsWith("/") ? path : "/".concat(path);
    return "".concat(trimmedUrl).concat(path);
}
function getBaseURL(url, path, request, loadEnv, trustedProxyHeaders) {
    if (url) return withPath(url, path);
    if (loadEnv !== false) {
        var fromEnv = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].BETTER_AUTH_URL || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].NEXT_PUBLIC_BETTER_AUTH_URL || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].PUBLIC_BETTER_AUTH_URL || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].NUXT_PUBLIC_BETTER_AUTH_URL || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].NUXT_PUBLIC_AUTH_URL || (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].BASE_URL !== "/" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].BASE_URL : void 0);
        if (fromEnv) return withPath(fromEnv, path);
    }
    var fromRequest = request === null || request === void 0 ? void 0 : request.headers.get("x-forwarded-host");
    var fromRequestProto = request === null || request === void 0 ? void 0 : request.headers.get("x-forwarded-proto");
    if (fromRequest && fromRequestProto && trustedProxyHeaders) return withPath("".concat(fromRequestProto, "://").concat(fromRequest), path);
    if (request) {
        var url$1 = getOrigin(request.url);
        if (!url$1) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"]("Could not get origin from request. Please provide a valid base URL.");
        return withPath(url$1, path);
    }
    if (typeof window !== "undefined" && window.location) return withPath(window.location.origin, path);
}
function getOrigin(url) {
    try {
        var parsedUrl = new URL(url);
        return parsedUrl.origin === "null" ? null : parsedUrl.origin;
    } catch (error) {
        return null;
    }
}
function getProtocol(url) {
    try {
        return new URL(url).protocol;
    } catch (error) {
        return null;
    }
}
function getHost(url) {
    try {
        return new URL(url).host;
    } catch (error) {
        return null;
    }
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/parser-g6CH-tVp.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "t",
    ()=>parseJSON
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_instanceof$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_instanceof.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_sliced_to_array.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [app-client] (ecmascript)");
;
;
;
//#region src/client/parser.ts
var PROTO_POLLUTION_PATTERNS = {
    proto: /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
    constructor: /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
    protoShort: /"__proto__"\s*:/,
    constructorShort: /"constructor"\s*:/
};
var JSON_SIGNATURE = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
var SPECIAL_VALUES = {
    true: true,
    false: false,
    null: null,
    undefined: void 0,
    nan: NaN,
    infinity: Number.POSITIVE_INFINITY,
    "-infinity": Number.NEGATIVE_INFINITY
};
var ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;
function isValidDate(date) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_instanceof$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(date, Date) && !isNaN(date.getTime());
}
function parseISODate(value) {
    var match = ISO_DATE_REGEX.exec(value);
    if (!match) return null;
    var _match = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(match, 11), year = _match[1], month = _match[2], day = _match[3], hour = _match[4], minute = _match[5], second = _match[6], ms = _match[7], offsetSign = _match[8], offsetHour = _match[9], offsetMinute = _match[10];
    var date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), ms ? parseInt(ms.padEnd(3, "0"), 10) : 0));
    if (offsetSign) {
        var offset = (parseInt(offsetHour, 10) * 60 + parseInt(offsetMinute, 10)) * (offsetSign === "+" ? -1 : 1);
        date.setUTCMinutes(date.getUTCMinutes() + offset);
    }
    return isValidDate(date) ? date : null;
}
function betterJSONParse(value) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var _options_strict = options.strict, strict = _options_strict === void 0 ? false : _options_strict, _options_warnings = options.warnings, warnings = _options_warnings === void 0 ? false : _options_warnings, reviver = options.reviver, _options_parseDates = options.parseDates, parseDates = _options_parseDates === void 0 ? true : _options_parseDates;
    if (typeof value !== "string") return value;
    var trimmed = value.trim();
    if (trimmed.length > 0 && trimmed[0] === "\"" && trimmed.endsWith("\"") && !trimmed.slice(1, -1).includes("\"")) return trimmed.slice(1, -1);
    var lowerValue = trimmed.toLowerCase();
    if (lowerValue.length <= 9 && lowerValue in SPECIAL_VALUES) return SPECIAL_VALUES[lowerValue];
    if (!JSON_SIGNATURE.test(trimmed)) {
        if (strict) throw new SyntaxError("[better-json] Invalid JSON");
        return value;
    }
    if (Object.entries(PROTO_POLLUTION_PATTERNS).some(function(param) {
        var _param = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(param, 2), key = _param[0], pattern = _param[1];
        var matches = pattern.test(trimmed);
        if (matches && warnings) console.warn("[better-json] Detected potential prototype pollution attempt using ".concat(key, " pattern"));
        return matches;
    }) && strict) throw new Error("[better-json] Potential prototype pollution attempt detected");
    try {
        var secureReviver = function(key, value$1) {
            if (key === "__proto__" || key === "constructor" && value$1 && (typeof value$1 === "undefined" ? "undefined" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(value$1)) === "object" && "prototype" in value$1) {
                if (warnings) console.warn('[better-json] Dropping "'.concat(key, '" key to prevent prototype pollution'));
                return;
            }
            if (parseDates && typeof value$1 === "string") {
                var date = parseISODate(value$1);
                if (date) return date;
            }
            return reviver ? reviver(key, value$1) : value$1;
        };
        return JSON.parse(trimmed, secureReviver);
    } catch (error) {
        if (strict) throw error;
        return value;
    }
}
function parseJSON(value) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
        strict: true
    };
    return betterJSONParse(value, options);
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "a",
    ()=>kOnlineManager,
    "c",
    ()=>kBroadcastChannel,
    "i",
    ()=>useAuthQuery,
    "n",
    ()=>getClientConfig,
    "o",
    ()=>kFocusManager,
    "r",
    ()=>createSessionRefreshManager,
    "s",
    ()=>getGlobalBroadcastChannel,
    "t",
    ()=>createDynamicPathProxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_async_to_generator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_class_call_check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_class_call_check.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_create_class$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_create_class.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_spread.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_spread_props.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_without_properties$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_without_properties.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_to_consumable_array.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__ = __turbopack_context__.i("[project]/node_modules/tslib/tslib.es6.mjs [app-client] (ecmascript) <export __generator as _>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$url$2d$B7VXiggp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/url-B7VXiggp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$parser$2d$g6CH$2d$tVp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/parser-g6CH-tVp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nanostores/atom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$lifecycle$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nanostores/lifecycle/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$fetch$2f$fetch$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-fetch/fetch/dist/index.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
//#region src/client/broadcast-channel.ts
var kBroadcastChannel = Symbol.for("better-auth:broadcast-channel");
var now$1 = function() {
    return Math.floor(Date.now() / 1e3);
};
var WindowBroadcastChannel = /*#__PURE__*/ function() {
    "use strict";
    function WindowBroadcastChannel() {
        var name = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "better-auth.message";
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_class_call_check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, WindowBroadcastChannel);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "listeners", /* @__PURE__ */ new Set());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "name", void 0);
        this.name = name;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_create_class$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(WindowBroadcastChannel, [
        {
            key: "subscribe",
            value: function subscribe(listener) {
                var _this = this;
                this.listeners.add(listener);
                return function() {
                    _this.listeners.delete(listener);
                };
            }
        },
        {
            key: "post",
            value: function post(message) {
                if (typeof window === "undefined") return;
                try {
                    localStorage.setItem(this.name, JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({}, message), {
                        timestamp: now$1()
                    })));
                } catch (e) {}
            }
        },
        {
            key: "setup",
            value: function setup() {
                var _this = this;
                if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return function() {};
                var handler = function(event) {
                    if (event.key !== _this.name) return;
                    var _event_newValue;
                    var message = JSON.parse((_event_newValue = event.newValue) !== null && _event_newValue !== void 0 ? _event_newValue : "{}");
                    if ((message === null || message === void 0 ? void 0 : message.event) !== "session" || !(message === null || message === void 0 ? void 0 : message.data)) return;
                    _this.listeners.forEach(function(listener) {
                        return listener(message);
                    });
                };
                window.addEventListener("storage", handler);
                return function() {
                    window.removeEventListener("storage", handler);
                };
            }
        }
    ]);
    return WindowBroadcastChannel;
}();
function getGlobalBroadcastChannel() {
    var name = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "better-auth.message";
    if (!globalThis[kBroadcastChannel]) globalThis[kBroadcastChannel] = new WindowBroadcastChannel(name);
    return globalThis[kBroadcastChannel];
}
//#endregion
//#region src/client/focus-manager.ts
var kFocusManager = Symbol.for("better-auth:focus-manager");
var WindowFocusManager = /*#__PURE__*/ function() {
    "use strict";
    function WindowFocusManager() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_class_call_check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, WindowFocusManager);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "listeners", /* @__PURE__ */ new Set());
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_create_class$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(WindowFocusManager, [
        {
            key: "subscribe",
            value: function subscribe(listener) {
                var _this = this;
                this.listeners.add(listener);
                return function() {
                    _this.listeners.delete(listener);
                };
            }
        },
        {
            key: "setFocused",
            value: function setFocused(focused) {
                this.listeners.forEach(function(listener) {
                    return listener(focused);
                });
            }
        },
        {
            key: "setup",
            value: function setup() {
                var _this = this;
                if (typeof window === "undefined" || typeof document === "undefined" || typeof window.addEventListener === "undefined") return function() {};
                var visibilityHandler = function() {
                    if (document.visibilityState === "visible") _this.setFocused(true);
                };
                document.addEventListener("visibilitychange", visibilityHandler, false);
                return function() {
                    document.removeEventListener("visibilitychange", visibilityHandler, false);
                };
            }
        }
    ]);
    return WindowFocusManager;
}();
function getGlobalFocusManager() {
    if (!globalThis[kFocusManager]) globalThis[kFocusManager] = new WindowFocusManager();
    return globalThis[kFocusManager];
}
//#endregion
//#region src/client/online-manager.ts
var kOnlineManager = Symbol.for("better-auth:online-manager");
var WindowOnlineManager = /*#__PURE__*/ function() {
    "use strict";
    function WindowOnlineManager() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_class_call_check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, WindowOnlineManager);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "listeners", /* @__PURE__ */ new Set());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "isOnline", typeof navigator !== "undefined" ? navigator.onLine : true);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_create_class$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(WindowOnlineManager, [
        {
            key: "subscribe",
            value: function subscribe(listener) {
                var _this = this;
                this.listeners.add(listener);
                return function() {
                    _this.listeners.delete(listener);
                };
            }
        },
        {
            key: "setOnline",
            value: function setOnline(online) {
                this.isOnline = online;
                this.listeners.forEach(function(listener) {
                    return listener(online);
                });
            }
        },
        {
            key: "setup",
            value: function setup() {
                var _this = this;
                if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return function() {};
                var onOnline = function() {
                    return _this.setOnline(true);
                };
                var onOffline = function() {
                    return _this.setOnline(false);
                };
                window.addEventListener("online", onOnline, false);
                window.addEventListener("offline", onOffline, false);
                return function() {
                    window.removeEventListener("online", onOnline, false);
                    window.removeEventListener("offline", onOffline, false);
                };
            }
        }
    ]);
    return WindowOnlineManager;
}();
function getGlobalOnlineManager() {
    if (!globalThis[kOnlineManager]) globalThis[kOnlineManager] = new WindowOnlineManager();
    return globalThis[kOnlineManager];
}
//#endregion
//#region src/client/query.ts
var isServer = function() {
    return typeof window === "undefined";
};
var useAuthQuery = function(initializedAtom, path, $fetch, options) {
    var value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["atom"])({
        data: null,
        error: null,
        isPending: true,
        isRefetching: false,
        refetch: function(queryParams) {
            return fn(queryParams);
        }
    });
    var fn = function(queryParams) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                return [
                    2,
                    new Promise(function(resolve) {
                        var opts = typeof options === "function" ? options({
                            data: value.get().data,
                            error: value.get().error,
                            isPending: value.get().isPending
                        }) : options;
                        $fetch(path, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({}, opts), {
                            query: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({}, opts === null || opts === void 0 ? void 0 : opts.query, queryParams === null || queryParams === void 0 ? void 0 : queryParams.query),
                            onSuccess: function onSuccess(context) {
                                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                                    var _opts_onSuccess;
                                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                                        switch(_state.label){
                                            case 0:
                                                value.set({
                                                    data: context.data,
                                                    error: null,
                                                    isPending: false,
                                                    isRefetching: false,
                                                    refetch: value.value.refetch
                                                });
                                                return [
                                                    4,
                                                    opts === null || opts === void 0 ? void 0 : (_opts_onSuccess = opts.onSuccess) === null || _opts_onSuccess === void 0 ? void 0 : _opts_onSuccess.call(opts, context)
                                                ];
                                            case 1:
                                                _state.sent();
                                                return [
                                                    2
                                                ];
                                        }
                                    });
                                })();
                            },
                            onError: function onError(context) {
                                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                                    var _request_retry, _opts_onError, request, retryAttempts, retryAttempt;
                                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                                        switch(_state.label){
                                            case 0:
                                                request = context.request;
                                                retryAttempts = typeof request.retry === "number" ? request.retry : (_request_retry = request.retry) === null || _request_retry === void 0 ? void 0 : _request_retry.attempts;
                                                retryAttempt = request.retryAttempt || 0;
                                                if (retryAttempts && retryAttempt < retryAttempts) return [
                                                    2
                                                ];
                                                value.set({
                                                    error: context.error,
                                                    data: null,
                                                    isPending: false,
                                                    isRefetching: false,
                                                    refetch: value.value.refetch
                                                });
                                                return [
                                                    4,
                                                    opts === null || opts === void 0 ? void 0 : (_opts_onError = opts.onError) === null || _opts_onError === void 0 ? void 0 : _opts_onError.call(opts, context)
                                                ];
                                            case 1:
                                                _state.sent();
                                                return [
                                                    2
                                                ];
                                        }
                                    });
                                })();
                            },
                            onRequest: function onRequest(context) {
                                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                                    var _opts_onRequest, currentValue;
                                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                                        switch(_state.label){
                                            case 0:
                                                currentValue = value.get();
                                                value.set({
                                                    isPending: currentValue.data === null,
                                                    data: currentValue.data,
                                                    error: null,
                                                    isRefetching: true,
                                                    refetch: value.value.refetch
                                                });
                                                return [
                                                    4,
                                                    opts === null || opts === void 0 ? void 0 : (_opts_onRequest = opts.onRequest) === null || _opts_onRequest === void 0 ? void 0 : _opts_onRequest.call(opts, context)
                                                ];
                                            case 1:
                                                _state.sent();
                                                return [
                                                    2
                                                ];
                                        }
                                    });
                                })();
                            }
                        })).catch(function(error) {
                            value.set({
                                error: error,
                                data: null,
                                isPending: false,
                                isRefetching: false,
                                refetch: value.value.refetch
                            });
                        }).finally(function() {
                            resolve(void 0);
                        });
                    })
                ];
            });
        })();
    };
    initializedAtom = Array.isArray(initializedAtom) ? initializedAtom : [
        initializedAtom
    ];
    var isMounted = false;
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        var _loop = function() {
            var initAtom = _step.value;
            initAtom.subscribe(function() {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                if (isServer()) return [
                                    2
                                ];
                                if (!isMounted) return [
                                    3,
                                    2
                                ];
                                return [
                                    4,
                                    fn()
                                ];
                            case 1:
                                _state.sent();
                                return [
                                    3,
                                    3
                                ];
                            case 2:
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$lifecycle$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onMount"])(value, function() {
                                    var timeoutId = setTimeout(function() {
                                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                                                switch(_state.label){
                                                    case 0:
                                                        if (!!isMounted) return [
                                                            3,
                                                            2
                                                        ];
                                                        return [
                                                            4,
                                                            fn()
                                                        ];
                                                    case 1:
                                                        _state.sent();
                                                        isMounted = true;
                                                        _state.label = 2;
                                                    case 2:
                                                        return [
                                                            2
                                                        ];
                                                }
                                            });
                                        })();
                                    }, 0);
                                    return function() {
                                        value.off();
                                        initAtom.off();
                                        clearTimeout(timeoutId);
                                    };
                                });
                                _state.label = 3;
                            case 3:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            });
        };
        for(var _iterator = initializedAtom[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    return value;
};
//#endregion
//#region src/client/session-refresh.ts
var now = function() {
    return Math.floor(Date.now() / 1e3);
};
/**
* Rate limit: don't refetch on focus if a session request was made within this many seconds
*/ var FOCUS_REFETCH_RATE_LIMIT_SECONDS = 5;
function createSessionRefreshManager(opts) {
    var _options_sessionOptions, _options_sessionOptions1, _options_sessionOptions2;
    var sessionAtom = opts.sessionAtom, sessionSignal = opts.sessionSignal, $fetch = opts.$fetch, _opts_options = opts.options, options = _opts_options === void 0 ? {} : _opts_options;
    var _options_sessionOptions_refetchInterval;
    var refetchInterval = (_options_sessionOptions_refetchInterval = (_options_sessionOptions = options.sessionOptions) === null || _options_sessionOptions === void 0 ? void 0 : _options_sessionOptions.refetchInterval) !== null && _options_sessionOptions_refetchInterval !== void 0 ? _options_sessionOptions_refetchInterval : 0;
    var _options_sessionOptions_refetchOnWindowFocus;
    var refetchOnWindowFocus = (_options_sessionOptions_refetchOnWindowFocus = (_options_sessionOptions1 = options.sessionOptions) === null || _options_sessionOptions1 === void 0 ? void 0 : _options_sessionOptions1.refetchOnWindowFocus) !== null && _options_sessionOptions_refetchOnWindowFocus !== void 0 ? _options_sessionOptions_refetchOnWindowFocus : true;
    var _options_sessionOptions_refetchWhenOffline;
    var refetchWhenOffline = (_options_sessionOptions_refetchWhenOffline = (_options_sessionOptions2 = options.sessionOptions) === null || _options_sessionOptions2 === void 0 ? void 0 : _options_sessionOptions2.refetchWhenOffline) !== null && _options_sessionOptions_refetchWhenOffline !== void 0 ? _options_sessionOptions_refetchWhenOffline : false;
    var state = {
        lastSync: 0,
        lastSessionRequest: 0,
        cachedSession: void 0
    };
    var shouldRefetch = function() {
        return refetchWhenOffline || getGlobalOnlineManager().isOnline;
    };
    var triggerRefetch = function(event) {
        if (!shouldRefetch()) return;
        if ((event === null || event === void 0 ? void 0 : event.event) === "storage") {
            state.lastSync = now();
            sessionSignal.set(!sessionSignal.get());
            return;
        }
        var currentSession = sessionAtom.get();
        if ((event === null || event === void 0 ? void 0 : event.event) === "poll") {
            state.lastSessionRequest = now();
            $fetch("/get-session").then(function(res) {
                sessionAtom.set((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({}, currentSession), {
                    data: res.data,
                    error: res.error || null
                }));
                state.lastSync = now();
                sessionSignal.set(!sessionSignal.get());
            }).catch(function() {});
            return;
        }
        if ((event === null || event === void 0 ? void 0 : event.event) === "visibilitychange") {
            if (now() - state.lastSessionRequest < FOCUS_REFETCH_RATE_LIMIT_SECONDS && (currentSession === null || currentSession === void 0 ? void 0 : currentSession.data) !== null && (currentSession === null || currentSession === void 0 ? void 0 : currentSession.data) !== void 0) return;
        }
        if ((currentSession === null || currentSession === void 0 ? void 0 : currentSession.data) === null || (currentSession === null || currentSession === void 0 ? void 0 : currentSession.data) === void 0 || (event === null || event === void 0 ? void 0 : event.event) === "visibilitychange") {
            if ((event === null || event === void 0 ? void 0 : event.event) === "visibilitychange") state.lastSessionRequest = now();
            state.lastSync = now();
            sessionSignal.set(!sessionSignal.get());
        }
    };
    var broadcastSessionUpdate = function(trigger) {
        getGlobalBroadcastChannel().post({
            event: "session",
            data: {
                trigger: trigger
            },
            clientId: Math.random().toString(36).substring(7)
        });
    };
    var setupPolling = function() {
        if (refetchInterval && refetchInterval > 0) state.pollInterval = setInterval(function() {
            var _sessionAtom_get;
            if ((_sessionAtom_get = sessionAtom.get()) === null || _sessionAtom_get === void 0 ? void 0 : _sessionAtom_get.data) triggerRefetch({
                event: "poll"
            });
        }, refetchInterval * 1e3);
    };
    var setupBroadcast = function() {
        state.unsubscribeBroadcast = getGlobalBroadcastChannel().subscribe(function() {
            triggerRefetch({
                event: "storage"
            });
        });
    };
    var setupFocusRefetch = function() {
        if (!refetchOnWindowFocus) return;
        state.unsubscribeFocus = getGlobalFocusManager().subscribe(function() {
            triggerRefetch({
                event: "visibilitychange"
            });
        });
    };
    var setupOnlineRefetch = function() {
        state.unsubscribeOnline = getGlobalOnlineManager().subscribe(function(online) {
            if (online) triggerRefetch({
                event: "visibilitychange"
            });
        });
    };
    var init = function() {
        setupPolling();
        setupBroadcast();
        setupFocusRefetch();
        setupOnlineRefetch();
        getGlobalBroadcastChannel().setup();
        getGlobalFocusManager().setup();
        getGlobalOnlineManager().setup();
    };
    var cleanup = function() {
        if (state.pollInterval) {
            clearInterval(state.pollInterval);
            state.pollInterval = void 0;
        }
        if (state.unsubscribeBroadcast) {
            state.unsubscribeBroadcast();
            state.unsubscribeBroadcast = void 0;
        }
        if (state.unsubscribeFocus) {
            state.unsubscribeFocus();
            state.unsubscribeFocus = void 0;
        }
        if (state.unsubscribeOnline) {
            state.unsubscribeOnline();
            state.unsubscribeOnline = void 0;
        }
        state.lastSync = 0;
        state.lastSessionRequest = 0;
        state.cachedSession = void 0;
    };
    return {
        init: init,
        cleanup: cleanup,
        triggerRefetch: triggerRefetch,
        broadcastSessionUpdate: broadcastSessionUpdate
    };
}
//#endregion
//#region src/client/fetch-plugins.ts
var redirectPlugin = {
    id: "redirect",
    name: "Redirect",
    hooks: {
        onSuccess: function onSuccess(context) {
            var _context_data, _context_data1;
            if (((_context_data = context.data) === null || _context_data === void 0 ? void 0 : _context_data.url) && ((_context_data1 = context.data) === null || _context_data1 === void 0 ? void 0 : _context_data1.redirect)) {
                if (typeof window !== "undefined" && window.location) {
                    if (window.location) try {
                        window.location.href = context.data.url;
                    } catch (e) {}
                }
            }
        }
    }
};
//#endregion
//#region src/client/session-atom.ts
function getSessionAtom($fetch, options) {
    var $signal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["atom"])(false);
    var session = useAuthQuery($signal, "/get-session", $fetch, {
        method: "GET"
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$lifecycle$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onMount"])(session, function() {
        var refreshManager = createSessionRefreshManager({
            sessionAtom: session,
            sessionSignal: $signal,
            $fetch: $fetch,
            options: options
        });
        refreshManager.init();
        return function() {
            refreshManager.cleanup();
        };
    });
    return {
        session: session,
        $sessionSignal: $signal
    };
}
//#endregion
//#region src/client/config.ts
var getClientConfig = function(options, loadEnv) {
    var _options_plugins, _options_fetchOptions, _options_fetchOptions1, _options_fetchOptions2, _options_fetchOptions3, _plugin_getActions;
    var isCredentialsSupported = "credentials" in Request.prototype;
    var _getBaseURL;
    var baseURL = (_getBaseURL = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$url$2d$B7VXiggp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"])(options === null || options === void 0 ? void 0 : options.baseURL, options === null || options === void 0 ? void 0 : options.basePath, void 0, loadEnv)) !== null && _getBaseURL !== void 0 ? _getBaseURL : "/api/auth";
    var pluginsFetchPlugins = (options === null || options === void 0 ? void 0 : (_options_plugins = options.plugins) === null || _options_plugins === void 0 ? void 0 : _options_plugins.flatMap(function(plugin) {
        return plugin.fetchPlugins;
    }).filter(function(pl) {
        return pl !== void 0;
    })) || [];
    var lifeCyclePlugin = {
        id: "lifecycle-hooks",
        name: "lifecycle-hooks",
        hooks: {
            onSuccess: options === null || options === void 0 ? void 0 : (_options_fetchOptions = options.fetchOptions) === null || _options_fetchOptions === void 0 ? void 0 : _options_fetchOptions.onSuccess,
            onError: options === null || options === void 0 ? void 0 : (_options_fetchOptions1 = options.fetchOptions) === null || _options_fetchOptions1 === void 0 ? void 0 : _options_fetchOptions1.onError,
            onRequest: options === null || options === void 0 ? void 0 : (_options_fetchOptions2 = options.fetchOptions) === null || _options_fetchOptions2 === void 0 ? void 0 : _options_fetchOptions2.onRequest,
            onResponse: options === null || options === void 0 ? void 0 : (_options_fetchOptions3 = options.fetchOptions) === null || _options_fetchOptions3 === void 0 ? void 0 : _options_fetchOptions3.onResponse
        }
    };
    var _ref = (options === null || options === void 0 ? void 0 : options.fetchOptions) || {}, onSuccess = _ref.onSuccess, onError = _ref.onError, onRequest = _ref.onRequest, onResponse = _ref.onResponse, restOfFetchOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_without_properties$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(_ref, [
        "onSuccess",
        "onError",
        "onRequest",
        "onResponse"
    ]);
    var $fetch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$fetch$2f$fetch$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createFetch"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({
        baseURL: baseURL
    }, isCredentialsSupported ? {
        credentials: "include"
    } : {}), {
        method: "GET",
        jsonParser: function jsonParser(text) {
            if (!text) return null;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$parser$2d$g6CH$2d$tVp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"])(text, {
                strict: false
            });
        },
        customFetchImpl: fetch
    }), restOfFetchOptions), {
        plugins: [
            lifeCyclePlugin
        ].concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(restOfFetchOptions.plugins || []), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((options === null || options === void 0 ? void 0 : options.disableDefaultFetchPlugins) ? [] : [
            redirectPlugin
        ]), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(pluginsFetchPlugins))
    }));
    var _getSessionAtom = getSessionAtom($fetch, options), $sessionSignal = _getSessionAtom.$sessionSignal, session = _getSessionAtom.session;
    var plugins = (options === null || options === void 0 ? void 0 : options.plugins) || [];
    var pluginsActions = {};
    var pluginsAtoms = {
        $sessionSignal: $sessionSignal,
        session: session
    };
    var pluginPathMethods = {
        "/sign-out": "POST",
        "/revoke-sessions": "POST",
        "/revoke-other-sessions": "POST",
        "/delete-user": "POST"
    };
    var atomListeners = [
        {
            signal: "$sessionSignal",
            matcher: function matcher(path) {
                return path === "/sign-out" || path === "/update-user" || path === "/sign-up/email" || path === "/sign-in/email" || path === "/delete-user" || path === "/verify-email" || path === "/revoke-sessions" || path === "/revoke-session" || path === "/change-email";
            }
        }
    ];
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var plugin = _step.value;
            var _atomListeners;
            var _plugin_getAtoms;
            if (plugin.getAtoms) Object.assign(pluginsAtoms, (_plugin_getAtoms = plugin.getAtoms) === null || _plugin_getAtoms === void 0 ? void 0 : _plugin_getAtoms.call(plugin, $fetch));
            if (plugin.pathMethods) Object.assign(pluginPathMethods, plugin.pathMethods);
            if (plugin.atomListeners) (_atomListeners = atomListeners).push.apply(_atomListeners, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(plugin.atomListeners));
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    var $store = {
        notify: function(signal) {
            pluginsAtoms[signal].set(!pluginsAtoms[signal].get());
        },
        listen: function(signal, listener) {
            pluginsAtoms[signal].subscribe(listener);
        },
        atoms: pluginsAtoms
    };
    var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
    try {
        for(var _iterator1 = plugins[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
            var plugin1 = _step1.value;
            if (plugin1.getActions) Object.assign(pluginsActions, (_plugin_getActions = plugin1.getActions) === null || _plugin_getActions === void 0 ? void 0 : _plugin_getActions.call(plugin1, $fetch, $store, options));
        }
    } catch (err) {
        _didIteratorError1 = true;
        _iteratorError1 = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                _iterator1.return();
            }
        } finally{
            if (_didIteratorError1) {
                throw _iteratorError1;
            }
        }
    }
    return {
        get baseURL () {
            return baseURL;
        },
        pluginsActions: pluginsActions,
        pluginsAtoms: pluginsAtoms,
        pluginPathMethods: pluginPathMethods,
        atomListeners: atomListeners,
        $fetch: $fetch,
        $store: $store
    };
};
//#endregion
//#region src/utils/is-atom.ts
function isAtom(value) {
    return (typeof value === "undefined" ? "undefined" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(value)) === "object" && value !== null && "get" in value && typeof value.get === "function" && "lc" in value && typeof value.lc === "number";
}
//#endregion
//#region src/client/proxy.ts
function getMethod(path, knownPathMethods, args) {
    var method = knownPathMethods[path];
    var _ref = args || {}, fetchOptions = _ref.fetchOptions, query = _ref.query, body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_without_properties$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(_ref, [
        "fetchOptions",
        "query"
    ]);
    if (method) return method;
    if (fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.method) return fetchOptions.method;
    if (body && Object.keys(body).length > 0) return "POST";
    return "GET";
}
function createDynamicPathProxy(routes, client, knownPathMethods, atoms, atomListeners) {
    function createProxy() {
        var path = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
        return new Proxy(function() {}, {
            get: function get(_, prop) {
                if (typeof prop !== "string") return;
                if (prop === "then" || prop === "catch" || prop === "finally") return;
                var fullPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(path).concat([
                    prop
                ]);
                var current = routes;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = fullPath[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var segment = _step.value;
                        if (current && (typeof current === "undefined" ? "undefined" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(current)) === "object" && segment in current) current = current[segment];
                        else {
                            current = void 0;
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                if (typeof current === "function") return current;
                if (isAtom(current)) return current;
                return createProxy(fullPath);
            },
            apply: function(_, __, args) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                    var routePath, arg, fetchOptions, query, argFetchOptions, body, options, method;
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                routePath = "/" + path.map(function(segment) {
                                    return segment.replace(/[A-Z]/g, function(letter) {
                                        return "-".concat(letter.toLowerCase());
                                    });
                                }).join("/");
                                arg = args[0] || {};
                                fetchOptions = args[1] || {};
                                query = arg.query, argFetchOptions = arg.fetchOptions, body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_without_properties$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(arg, [
                                    "query",
                                    "fetchOptions"
                                ]);
                                options = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({}, fetchOptions, argFetchOptions);
                                method = getMethod(routePath, knownPathMethods, arg);
                                return [
                                    4,
                                    client(routePath, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({}, options), {
                                        body: method === "GET" ? void 0 : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({}, body, (options === null || options === void 0 ? void 0 : options.body) || {}),
                                        query: query || (options === null || options === void 0 ? void 0 : options.query),
                                        method: method,
                                        onSuccess: function onSuccess(context) {
                                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                                                var _options_onSuccess, matches, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step, _ret;
                                                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                                                    switch(_state.label){
                                                        case 0:
                                                            return [
                                                                4,
                                                                options === null || options === void 0 ? void 0 : (_options_onSuccess = options.onSuccess) === null || _options_onSuccess === void 0 ? void 0 : _options_onSuccess.call(options, context)
                                                            ];
                                                        case 1:
                                                            _state.sent();
                                                            if (!atomListeners || options.disableSignal) return [
                                                                2
                                                            ];
                                                            /**
						* We trigger listeners
						*/ matches = atomListeners.filter(function(s) {
                                                                return s.matcher(routePath);
                                                            });
                                                            if (!matches.length) return [
                                                                2
                                                            ];
                                                            _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                                                            try {
                                                                _loop = function() {
                                                                    var match = _step.value;
                                                                    var signal = atoms[match.signal];
                                                                    if (!signal) return {
                                                                        v: void void 0
                                                                    };
                                                                    /**
							* To avoid race conditions we set the signal in a setTimeout
							*/ var val = signal.get();
                                                                    setTimeout(function() {
                                                                        signal.set(!val);
                                                                    }, 10);
                                                                };
                                                                for(_iterator = matches[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                                                                    _ret = _loop();
                                                                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(_ret) === "object") return [
                                                                        2,
                                                                        _ret.v
                                                                    ];
                                                                }
                                                            } catch (err) {
                                                                _didIteratorError = true;
                                                                _iteratorError = err;
                                                            } finally{
                                                                try {
                                                                    if (!_iteratorNormalCompletion && _iterator.return != null) {
                                                                        _iterator.return();
                                                                    }
                                                                } finally{
                                                                    if (_didIteratorError) {
                                                                        throw _iteratorError;
                                                                    }
                                                                }
                                                            }
                                                            return [
                                                                2
                                                            ];
                                                    }
                                                });
                                            })();
                                        }
                                    }))
                                ];
                            case 1:
                                return [
                                    2,
                                    _state.sent()
                                ];
                        }
                    });
                })();
            }
        });
    }
    return createProxy();
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-BJRbyWu7.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "n",
    ()=>InferPlugin,
    "r",
    ()=>createAuthClient,
    "t",
    ()=>InferAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_spread.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_spread_props.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_sliced_to_array.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__capitalizeFirstLetter$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils-BqQC77zO.mjs [app-client] (ecmascript) <export t as capitalizeFirstLetter>");
;
;
;
;
;
//#region src/client/vanilla.ts
function createAuthClient(options) {
    var _getClientConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["n"])(options), pluginPathMethods = _getClientConfig.pluginPathMethods, pluginsActions = _getClientConfig.pluginsActions, pluginsAtoms = _getClientConfig.pluginsAtoms, $fetch = _getClientConfig.$fetch, atomListeners = _getClientConfig.atomListeners, $store = _getClientConfig.$store;
    var resolvedHooks = {};
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = Object.entries(pluginsAtoms)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var _step_value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(_step.value, 2), key = _step_value[0], value = _step_value[1];
            resolvedHooks["use".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__capitalizeFirstLetter$3e$__["capitalizeFirstLetter"])(key))] = value;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({}, pluginsActions, resolvedHooks), {
        $fetch: $fetch,
        $store: $store
    }), $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
//#endregion
//#region src/client/index.ts
var InferPlugin = function() {
    return {
        id: "infer-server-plugin",
        $InferServerPlugin: {}
    };
};
function InferAuth() {
    return {};
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$url$2d$B7VXiggp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/url-B7VXiggp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$parser$2d$g6CH$2d$tVp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/parser-g6CH-tVp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2d$BJRbyWu7$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-BJRbyWu7.mjs [app-client] (ecmascript)");
;
;
;
;
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-client] (ecmascript) <export s as getGlobalBroadcastChannel>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGlobalBroadcastChannel",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BCQibqkF.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "n",
    ()=>role,
    "t",
    ()=>createAccessControl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_sliced_to_array.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error-CMXuwPsa.mjs [app-client] (ecmascript) <export t as BetterAuthError>");
;
;
;
//#region src/plugins/access/access.ts
function role(statements) {
    return {
        authorize: function authorize(request) {
            var connector = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "AND";
            var success = false;
            var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
            try {
                var _loop = function() {
                    var _step_value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(_step.value, 2), requestedResource = _step_value[0], requestedActions = _step_value[1];
                    var allowedActions = statements[requestedResource];
                    if (!allowedActions) return {
                        v: {
                            success: false,
                            error: "You are not allowed to access resource: ".concat(requestedResource)
                        }
                    };
                    if (Array.isArray(requestedActions)) success = requestedActions.every(function(requestedAction) {
                        return allowedActions.includes(requestedAction);
                    });
                    else if ((typeof requestedActions === "undefined" ? "undefined" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(requestedActions)) === "object") {
                        var actions = requestedActions;
                        if (actions.connector === "OR") success = actions.actions.some(function(requestedAction) {
                            return allowedActions.includes(requestedAction);
                        });
                        else success = actions.actions.every(function(requestedAction) {
                            return allowedActions.includes(requestedAction);
                        });
                    } else throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"]("Invalid access control request");
                    if (success && connector === "OR") return {
                        v: {
                            success: success
                        }
                    };
                    if (!success && connector === "AND") return {
                        v: {
                            success: false,
                            error: 'unauthorized to access resource "'.concat(requestedResource, '"')
                        }
                    };
                };
                for(var _iterator = Object.entries(request)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                    var _ret = _loop();
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(_ret) === "object") return _ret.v;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion && _iterator.return != null) {
                        _iterator.return();
                    }
                } finally{
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
            if (success) return {
                success: success
            };
            return {
                success: false,
                error: "Not authorized"
            };
        },
        statements: statements
    };
}
function createAccessControl(s) {
    return {
        newRole: function newRole(statements) {
            return role(statements);
        },
        statements: s
    };
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-DZRRE6Tq.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "a",
    ()=>userAc,
    "i",
    ()=>defaultStatements,
    "n",
    ()=>defaultAc,
    "r",
    ()=>defaultRoles,
    "t",
    ()=>adminAc
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BCQibqkF$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BCQibqkF.mjs [app-client] (ecmascript)");
;
//#region src/plugins/admin/access/statement.ts
var defaultStatements = {
    user: [
        "create",
        "list",
        "set-role",
        "ban",
        "impersonate",
        "delete",
        "set-password",
        "get",
        "update"
    ],
    session: [
        "list",
        "revoke",
        "delete"
    ]
};
var defaultAc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BCQibqkF$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"])(defaultStatements);
var adminAc = defaultAc.newRole({
    user: [
        "create",
        "list",
        "set-role",
        "ban",
        "impersonate",
        "delete",
        "set-password",
        "get",
        "update"
    ],
    session: [
        "list",
        "revoke",
        "delete"
    ]
});
var userAc = defaultAc.newRole({
    user: [],
    session: []
});
var defaultRoles = {
    admin: adminAc,
    user: userAc
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/has-permission-BxveqtYZ.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "t",
    ()=>hasPermission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$DZRRE6Tq$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-DZRRE6Tq.mjs [app-client] (ecmascript)");
;
//#region src/plugins/admin/has-permission.ts
var hasPermission = function(input) {
    var _input_options_adminUserIds, _input_options, _input_options1, _input_options2, _this, _acRoles_role;
    if (input.userId && ((_input_options = input.options) === null || _input_options === void 0 ? void 0 : (_input_options_adminUserIds = _input_options.adminUserIds) === null || _input_options_adminUserIds === void 0 ? void 0 : _input_options_adminUserIds.includes(input.userId))) return true;
    if (!input.permissions && !input.permission) return false;
    var roles = (input.role || ((_input_options1 = input.options) === null || _input_options1 === void 0 ? void 0 : _input_options1.defaultRole) || "user").split(",");
    var acRoles = ((_input_options2 = input.options) === null || _input_options2 === void 0 ? void 0 : _input_options2.roles) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$DZRRE6Tq$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"];
    var _input_permission;
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = roles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var role = _step.value;
            if ((_this = (_acRoles_role = acRoles[role]) === null || _acRoles_role === void 0 ? void 0 : _acRoles_role.authorize((_input_permission = input.permission) !== null && _input_permission !== void 0 ? _input_permission : input.permissions)) === null || _this === void 0 ? void 0 : _this.success) return true;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    return false;
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BktEfzR6.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "a",
    ()=>memberAc,
    "i",
    ()=>defaultStatements,
    "n",
    ()=>defaultAc,
    "o",
    ()=>ownerAc,
    "r",
    ()=>defaultRoles,
    "t",
    ()=>adminAc
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BCQibqkF$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BCQibqkF.mjs [app-client] (ecmascript)");
;
//#region src/plugins/organization/access/statement.ts
var defaultStatements = {
    organization: [
        "update",
        "delete"
    ],
    member: [
        "create",
        "update",
        "delete"
    ],
    invitation: [
        "create",
        "cancel"
    ],
    team: [
        "create",
        "update",
        "delete"
    ],
    ac: [
        "create",
        "read",
        "update",
        "delete"
    ]
};
var defaultAc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BCQibqkF$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"])(defaultStatements);
var adminAc = defaultAc.newRole({
    organization: [
        "update"
    ],
    invitation: [
        "create",
        "cancel"
    ],
    member: [
        "create",
        "update",
        "delete"
    ],
    team: [
        "create",
        "update",
        "delete"
    ],
    ac: [
        "create",
        "read",
        "update",
        "delete"
    ]
});
var ownerAc = defaultAc.newRole({
    organization: [
        "update",
        "delete"
    ],
    member: [
        "create",
        "update",
        "delete"
    ],
    invitation: [
        "create",
        "cancel"
    ],
    team: [
        "create",
        "update",
        "delete"
    ],
    ac: [
        "create",
        "read",
        "update",
        "delete"
    ]
});
var memberAc = defaultAc.newRole({
    organization: [],
    member: [],
    invitation: [],
    team: [],
    ac: [
        "read"
    ]
});
var defaultRoles = {
    admin: adminAc,
    owner: ownerAc,
    member: memberAc
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/permission-BZUPzNK6.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "n",
    ()=>hasPermissionFn,
    "t",
    ()=>cacheAllRoles
]);
//#region src/plugins/organization/permission.ts
var hasPermissionFn = function(input, acRoles) {
    var _this, _acRoles_role;
    if (!input.permissions && !input.permission) return false;
    var roles = input.role.split(",");
    var creatorRole = input.options.creatorRole || "owner";
    var isCreator = roles.includes(creatorRole);
    var allowCreatorsAllPermissions = input.allowCreatorAllPermissions || false;
    if (isCreator && allowCreatorsAllPermissions) return true;
    var _input_permissions;
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = roles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var role = _step.value;
            if ((_this = (_acRoles_role = acRoles[role]) === null || _acRoles_role === void 0 ? void 0 : _acRoles_role.authorize((_input_permissions = input.permissions) !== null && _input_permissions !== void 0 ? _input_permissions : input.permission)) === null || _this === void 0 ? void 0 : _this.success) return true;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    return false;
};
var cacheAllRoles = /* @__PURE__ */ new Map();
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-7xkXfvW4.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "t",
    ()=>twoFactorClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_async_to_generator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__ = __turbopack_context__.i("[project]/node_modules/tslib/tslib.es6.mjs [app-client] (ecmascript) <export __generator as _>");
;
;
//#region src/plugins/two-factor/client.ts
var twoFactorClient = function(options) {
    return {
        id: "two-factor",
        $InferServerPlugin: {},
        atomListeners: [
            {
                matcher: function(path) {
                    return path.startsWith("/two-factor/");
                },
                signal: "$sessionSignal"
            }
        ],
        pathMethods: {
            "/two-factor/disable": "POST",
            "/two-factor/enable": "POST",
            "/two-factor/send-otp": "POST",
            "/two-factor/generate-backup-codes": "POST"
        },
        fetchPlugins: [
            {
                id: "two-factor",
                name: "two-factor",
                hooks: {
                    onSuccess: function onSuccess(context) {
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                            var _context_data;
                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                                switch(_state.label){
                                    case 0:
                                        if (!((_context_data = context.data) === null || _context_data === void 0 ? void 0 : _context_data.twoFactorRedirect)) return [
                                            3,
                                            2
                                        ];
                                        if (!(options === null || options === void 0 ? void 0 : options.onTwoFactorRedirect)) return [
                                            3,
                                            2
                                        ];
                                        return [
                                            4,
                                            options.onTwoFactorRedirect()
                                        ];
                                    case 1:
                                        _state.sent();
                                        _state.label = 2;
                                    case 2:
                                        return [
                                            2
                                        ];
                                }
                            });
                        })();
                    }
                }
            }
        ]
    };
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client/plugins/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InferServerPlugin",
    ()=>InferServerPlugin,
    "adminClient",
    ()=>adminClient,
    "anonymousClient",
    ()=>anonymousClient,
    "apiKeyClient",
    ()=>apiKeyClient,
    "clientSideHasPermission",
    ()=>clientSideHasPermission,
    "customSessionClient",
    ()=>customSessionClient,
    "deviceAuthorizationClient",
    ()=>deviceAuthorizationClient,
    "emailOTPClient",
    ()=>emailOTPClient,
    "genericOAuthClient",
    ()=>genericOAuthClient,
    "inferAdditionalFields",
    ()=>inferAdditionalFields,
    "inferOrgAdditionalFields",
    ()=>inferOrgAdditionalFields,
    "jwtClient",
    ()=>jwtClient,
    "lastLoginMethodClient",
    ()=>lastLoginMethodClient,
    "magicLinkClient",
    ()=>magicLinkClient,
    "multiSessionClient",
    ()=>multiSessionClient,
    "oidcClient",
    ()=>oidcClient,
    "oneTapClient",
    ()=>oneTapClient,
    "oneTimeTokenClient",
    ()=>oneTimeTokenClient,
    "organizationClient",
    ()=>organizationClient,
    "phoneNumberClient",
    ()=>phoneNumberClient,
    "siweClient",
    ()=>siweClient,
    "usernameClient",
    ()=>usernameClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_async_to_generator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_spread.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__ = __turbopack_context__.i("[project]/node_modules/tslib/tslib.es6.mjs [app-client] (ecmascript) <export __generator as _>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$url$2d$B7VXiggp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/url-B7VXiggp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$parser$2d$g6CH$2d$tVp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/parser-g6CH-tVp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2d$BJRbyWu7$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-BJRbyWu7.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BCQibqkF$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BCQibqkF.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$DZRRE6Tq$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-DZRRE6Tq.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$has$2d$permission$2d$BxveqtYZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/has-permission-BxveqtYZ.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BktEfzR6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BktEfzR6.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$permission$2d$BZUPzNK6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/permission-BZUPzNK6.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2d$7xkXfvW4$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-7xkXfvW4.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nanostores/atom/index.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
//#region src/plugins/additional-fields/client.ts
var inferAdditionalFields = function(schema) {
    return {
        id: "additional-fields-client",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/admin/client.ts
var adminClient = function(options) {
    var roles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({
        admin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$DZRRE6Tq$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"],
        user: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$DZRRE6Tq$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"]
    }, options === null || options === void 0 ? void 0 : options.roles);
    return {
        id: "admin-client",
        $InferServerPlugin: {},
        getActions: function() {
            return {
                admin: {
                    checkRolePermission: function(data) {
                        var _data_permissions;
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$has$2d$permission$2d$BxveqtYZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"])({
                            role: data.role,
                            options: {
                                ac: options === null || options === void 0 ? void 0 : options.ac,
                                roles: roles
                            },
                            permissions: (_data_permissions = data.permissions) !== null && _data_permissions !== void 0 ? _data_permissions : data.permission
                        });
                    }
                }
            };
        },
        pathMethods: {
            "/admin/list-users": "GET",
            "/admin/stop-impersonating": "POST"
        }
    };
};
//#endregion
//#region src/plugins/anonymous/client.ts
var anonymousClient = function() {
    return {
        id: "anonymous",
        $InferServerPlugin: {},
        pathMethods: {
            "/sign-in/anonymous": "POST"
        },
        atomListeners: [
            {
                matcher: function(path) {
                    return path === "/sign-in/anonymous";
                },
                signal: "$sessionSignal"
            }
        ]
    };
};
//#endregion
//#region src/plugins/api-key/client.ts
var apiKeyClient = function() {
    return {
        id: "api-key",
        $InferServerPlugin: {},
        pathMethods: {
            "/api-key/create": "POST",
            "/api-key/delete": "POST",
            "/api-key/delete-all-expired-api-keys": "POST"
        }
    };
};
//#endregion
//#region src/plugins/custom-session/client.ts
var customSessionClient = function() {
    return InferServerPlugin();
};
//#endregion
//#region src/plugins/device-authorization/client.ts
var deviceAuthorizationClient = function() {
    return {
        id: "device-authorization",
        $InferServerPlugin: {},
        pathMethods: {
            "/device/code": "POST",
            "/device/token": "POST",
            "/device": "GET",
            "/device/approve": "POST",
            "/device/deny": "POST"
        }
    };
};
//#endregion
//#region src/plugins/email-otp/client.ts
var emailOTPClient = function() {
    return {
        id: "email-otp",
        $InferServerPlugin: {},
        atomListeners: [
            {
                matcher: function(path) {
                    return path === "/email-otp/verify-email" || path === "/sign-in/email-otp";
                },
                signal: "$sessionSignal"
            }
        ]
    };
};
//#endregion
//#region src/plugins/generic-oauth/client.ts
var genericOAuthClient = function() {
    return {
        id: "generic-oauth-client",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/jwt/client.ts
var jwtClient = function(options) {
    var _options_jwks;
    var _options_jwks_jwksPath;
    var jwksPath = (_options_jwks_jwksPath = options === null || options === void 0 ? void 0 : (_options_jwks = options.jwks) === null || _options_jwks === void 0 ? void 0 : _options_jwks.jwksPath) !== null && _options_jwks_jwksPath !== void 0 ? _options_jwks_jwksPath : "/jwks";
    return {
        id: "better-auth-client",
        $InferServerPlugin: {},
        pathMethods: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({}, jwksPath, "GET"),
        getActions: function($fetch) {
            return {
                jwks: function(fetchOptions) {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                            switch(_state.label){
                                case 0:
                                    return [
                                        4,
                                        $fetch(jwksPath, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({
                                            method: "GET"
                                        }, fetchOptions))
                                    ];
                                case 1:
                                    return [
                                        2,
                                        _state.sent()
                                    ];
                            }
                        });
                    })();
                }
            };
        }
    };
};
//#endregion
//#region src/plugins/last-login-method/client.ts
function getCookieValue(name) {
    if (typeof document === "undefined") return null;
    var cookie = document.cookie.split("; ").find(function(row) {
        return row.startsWith("".concat(name, "="));
    });
    return cookie ? cookie.split("=")[1] : null;
}
/**
* Client-side plugin to retrieve the last used login method
*/ var lastLoginMethodClient = function() {
    var config = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var cookieName = config.cookieName || "better-auth.last_used_login_method";
    return {
        id: "last-login-method-client",
        getActions: function getActions() {
            return {
                getLastUsedLoginMethod: function() {
                    return getCookieValue(cookieName);
                },
                clearLastUsedLoginMethod: function() {
                    if (typeof document !== "undefined") document.cookie = "".concat(cookieName, "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;");
                },
                isLastUsedLoginMethod: function(method) {
                    return getCookieValue(cookieName) === method;
                }
            };
        }
    };
};
//#endregion
//#region src/plugins/magic-link/client.ts
var magicLinkClient = function() {
    return {
        id: "magic-link",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/multi-session/client.ts
var multiSessionClient = function(options) {
    return {
        id: "multi-session",
        $InferServerPlugin: {},
        atomListeners: [
            {
                matcher: function matcher(path) {
                    return path === "/multi-session/set-active";
                },
                signal: "$sessionSignal"
            }
        ]
    };
};
//#endregion
//#region src/plugins/oidc-provider/client.ts
var oidcClient = function() {
    return {
        id: "oidc-client",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/one-tap/client.ts
var isRequestInProgress = null;
function isFedCMSupported() {
    return typeof window !== "undefined" && "IdentityCredential" in window;
}
var oneTapClient = function(options) {
    return {
        id: "one-tap",
        fetchPlugins: [
            {
                id: "fedcm-signout-handle",
                name: "FedCM Sign-Out Handler",
                hooks: {
                    onResponse: function onResponse(ctx) {
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                            var _options_promptOptions;
                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                                if (!ctx.request.url.toString().includes("/sign-out")) return [
                                    2
                                ];
                                if (((_options_promptOptions = options.promptOptions) === null || _options_promptOptions === void 0 ? void 0 : _options_promptOptions.fedCM) === false || !isFedCMSupported()) return [
                                    2
                                ];
                                navigator.credentials.preventSilentAccess();
                                return [
                                    2
                                ];
                            });
                        })();
                    }
                }
            }
        ],
        getActions: function($fetch, _) {
            return {
                oneTap: function(opts, fetchOptions) {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                        var _ref, autoSelect, cancelOnTapOutside, context, _ref1, contextValue, clients, _options_promptOptions, client, error;
                        function callback(idToken) {
                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                                var _opts_callbackURL;
                                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                                    switch(_state.label){
                                        case 0:
                                            return [
                                                4,
                                                $fetch("/one-tap/callback", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({
                                                    method: "POST",
                                                    body: {
                                                        idToken: idToken
                                                    }
                                                }, opts === null || opts === void 0 ? void 0 : opts.fetchOptions, fetchOptions))
                                            ];
                                        case 1:
                                            _state.sent();
                                            if (!(opts === null || opts === void 0 ? void 0 : opts.fetchOptions) && !fetchOptions || (opts === null || opts === void 0 ? void 0 : opts.callbackURL)) window.location.href = (_opts_callbackURL = opts === null || opts === void 0 ? void 0 : opts.callbackURL) !== null && _opts_callbackURL !== void 0 ? _opts_callbackURL : "/";
                                            return [
                                                2
                                            ];
                                    }
                                });
                            })();
                        }
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                            switch(_state.label){
                                case 0:
                                    if (isRequestInProgress && !isRequestInProgress.signal.aborted) {
                                        console.warn("A Google One Tap request is already in progress. Please wait.");
                                        return [
                                            2
                                        ];
                                    }
                                    if (typeof window === "undefined" || !window.document) {
                                        console.warn("Google One Tap is only available in browser environments");
                                        return [
                                            2
                                        ];
                                    }
                                    _ref = opts !== null && opts !== void 0 ? opts : {}, autoSelect = _ref.autoSelect, cancelOnTapOutside = _ref.cancelOnTapOutside, context = _ref.context;
                                    contextValue = (_ref1 = context !== null && context !== void 0 ? context : options.context) !== null && _ref1 !== void 0 ? _ref1 : "signin";
                                    clients = {
                                        fedCM: function() {
                                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                                                var identityCredential, _opts_onPromptNotification, error, error1, _opts_onPromptNotification1;
                                                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                                                    switch(_state.label){
                                                        case 0:
                                                            _state.trys.push([
                                                                0,
                                                                6,
                                                                ,
                                                                7
                                                            ]);
                                                            return [
                                                                4,
                                                                navigator.credentials.get({
                                                                    identity: {
                                                                        context: contextValue,
                                                                        providers: [
                                                                            {
                                                                                configURL: "https://accounts.google.com/gsi/fedcm.json",
                                                                                clientId: options.clientId,
                                                                                nonce: opts === null || opts === void 0 ? void 0 : opts.nonce
                                                                            }
                                                                        ]
                                                                    },
                                                                    mediation: autoSelect ? "optional" : "required",
                                                                    signal: isRequestInProgress === null || isRequestInProgress === void 0 ? void 0 : isRequestInProgress.signal
                                                                })
                                                            ];
                                                        case 1:
                                                            identityCredential = _state.sent();
                                                            if (!(identityCredential === null || identityCredential === void 0 ? void 0 : identityCredential.token)) {
                                                                ;
                                                                opts === null || opts === void 0 ? void 0 : (_opts_onPromptNotification = opts.onPromptNotification) === null || _opts_onPromptNotification === void 0 ? void 0 : _opts_onPromptNotification.call(opts, void 0);
                                                                return [
                                                                    2
                                                                ];
                                                            }
                                                            _state.label = 2;
                                                        case 2:
                                                            _state.trys.push([
                                                                2,
                                                                4,
                                                                ,
                                                                5
                                                            ]);
                                                            return [
                                                                4,
                                                                callback(identityCredential.token)
                                                            ];
                                                        case 3:
                                                            _state.sent();
                                                            return [
                                                                2
                                                            ];
                                                        case 4:
                                                            error = _state.sent();
                                                            console.error("Error during FedCM callback:", error);
                                                            throw error;
                                                        case 5:
                                                            return [
                                                                3,
                                                                7
                                                            ];
                                                        case 6:
                                                            error1 = _state.sent();
                                                            if ((error1 === null || error1 === void 0 ? void 0 : error1.code) && (error1.code === 19 || error1.code === 20)) {
                                                                ;
                                                                opts === null || opts === void 0 ? void 0 : (_opts_onPromptNotification1 = opts.onPromptNotification) === null || _opts_onPromptNotification1 === void 0 ? void 0 : _opts_onPromptNotification1.call(opts, void 0);
                                                                return [
                                                                    2
                                                                ];
                                                            }
                                                            throw error1;
                                                        case 7:
                                                            return [
                                                                2
                                                            ];
                                                    }
                                                });
                                            })();
                                        },
                                        oneTap: function() {
                                            return new Promise(function(resolve, reject) {
                                                var _options_promptOptions, _options_promptOptions1, _window_google;
                                                var isResolved = false;
                                                var _options_promptOptions_baseDelay;
                                                var baseDelay = (_options_promptOptions_baseDelay = (_options_promptOptions = options.promptOptions) === null || _options_promptOptions === void 0 ? void 0 : _options_promptOptions.baseDelay) !== null && _options_promptOptions_baseDelay !== void 0 ? _options_promptOptions_baseDelay : 1e3;
                                                var _options_promptOptions_maxAttempts;
                                                var maxAttempts = (_options_promptOptions_maxAttempts = (_options_promptOptions1 = options.promptOptions) === null || _options_promptOptions1 === void 0 ? void 0 : _options_promptOptions1.maxAttempts) !== null && _options_promptOptions_maxAttempts !== void 0 ? _options_promptOptions_maxAttempts : 5;
                                                (_window_google = window.google) === null || _window_google === void 0 ? void 0 : _window_google.accounts.id.initialize((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({
                                                    client_id: options.clientId,
                                                    callback: function(response) {
                                                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(function() {
                                                            var error;
                                                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                                                                switch(_state.label){
                                                                    case 0:
                                                                        isResolved = true;
                                                                        _state.label = 1;
                                                                    case 1:
                                                                        _state.trys.push([
                                                                            1,
                                                                            3,
                                                                            ,
                                                                            4
                                                                        ]);
                                                                        return [
                                                                            4,
                                                                            callback(response.credential)
                                                                        ];
                                                                    case 2:
                                                                        _state.sent();
                                                                        resolve();
                                                                        return [
                                                                            3,
                                                                            4
                                                                        ];
                                                                    case 3:
                                                                        error = _state.sent();
                                                                        console.error("Error during One Tap callback:", error);
                                                                        reject(error);
                                                                        return [
                                                                            3,
                                                                            4
                                                                        ];
                                                                    case 4:
                                                                        return [
                                                                            2
                                                                        ];
                                                                }
                                                            });
                                                        })();
                                                    },
                                                    auto_select: autoSelect,
                                                    cancel_on_tap_outside: cancelOnTapOutside,
                                                    context: contextValue,
                                                    ux_mode: (opts === null || opts === void 0 ? void 0 : opts.uxMode) || "popup",
                                                    nonce: opts === null || opts === void 0 ? void 0 : opts.nonce,
                                                    itp_support: true
                                                }, options.additionalOptions));
                                                var handlePrompt = function(attempt) {
                                                    var _window_google;
                                                    if (isResolved) return;
                                                    (_window_google = window.google) === null || _window_google === void 0 ? void 0 : _window_google.accounts.id.prompt(function(notification) {
                                                        var _opts_onPromptNotification, _opts_onPromptNotification1;
                                                        if (isResolved) return;
                                                        if (notification.isDismissedMoment && notification.isDismissedMoment()) if (attempt < maxAttempts) {
                                                            var delay = Math.pow(2, attempt) * baseDelay;
                                                            setTimeout(function() {
                                                                return handlePrompt(attempt + 1);
                                                            }, delay);
                                                        } else opts === null || opts === void 0 ? void 0 : (_opts_onPromptNotification = opts.onPromptNotification) === null || _opts_onPromptNotification === void 0 ? void 0 : _opts_onPromptNotification.call(opts, notification);
                                                        else if (notification.isSkippedMoment && notification.isSkippedMoment()) if (attempt < maxAttempts) {
                                                            var delay1 = Math.pow(2, attempt) * baseDelay;
                                                            setTimeout(function() {
                                                                return handlePrompt(attempt + 1);
                                                            }, delay1);
                                                        } else opts === null || opts === void 0 ? void 0 : (_opts_onPromptNotification1 = opts.onPromptNotification) === null || _opts_onPromptNotification1 === void 0 ? void 0 : _opts_onPromptNotification1.call(opts, notification);
                                                    });
                                                };
                                                handlePrompt(0);
                                            });
                                        }
                                    };
                                    if (isRequestInProgress) isRequestInProgress === null || isRequestInProgress === void 0 ? void 0 : isRequestInProgress.abort();
                                    isRequestInProgress = new AbortController();
                                    _state.label = 1;
                                case 1:
                                    _state.trys.push([
                                        1,
                                        5,
                                        6,
                                        7
                                    ]);
                                    client = ((_options_promptOptions = options.promptOptions) === null || _options_promptOptions === void 0 ? void 0 : _options_promptOptions.fedCM) === false || !isFedCMSupported() ? "oneTap" : "fedCM";
                                    if (!(client === "oneTap")) return [
                                        3,
                                        3
                                    ];
                                    return [
                                        4,
                                        loadGoogleScript()
                                    ];
                                case 2:
                                    _state.sent();
                                    _state.label = 3;
                                case 3:
                                    return [
                                        4,
                                        clients[client]()
                                    ];
                                case 4:
                                    _state.sent();
                                    return [
                                        3,
                                        7
                                    ];
                                case 5:
                                    error = _state.sent();
                                    console.error("Error during Google One Tap flow:", error);
                                    throw error;
                                case 6:
                                    isRequestInProgress = null;
                                    return [
                                        7
                                    ];
                                case 7:
                                    return [
                                        2
                                    ];
                            }
                        });
                    })();
                }
            };
        },
        getAtoms: function getAtoms($fetch) {
            return {};
        }
    };
};
var loadGoogleScript = function() {
    return new Promise(function(resolve) {
        if (window.googleScriptInitialized) {
            resolve();
            return;
        }
        var script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = function() {
            window.googleScriptInitialized = true;
            resolve();
        };
        document.head.appendChild(script);
    });
};
//#endregion
//#region src/plugins/one-time-token/client.ts
var oneTimeTokenClient = function() {
    return {
        id: "one-time-token",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/organization/client.ts
/**
* Using the same `hasPermissionFn` function, but without the need for a `ctx` parameter or the `organizationId` parameter.
*/ var clientSideHasPermission = function(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$permission$2d$BZUPzNK6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["n"])(input, input.options.roles || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BktEfzR6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"]);
};
var organizationClient = function(options) {
    var $listOrg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["atom"])(false);
    var $activeOrgSignal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["atom"])(false);
    var $activeMemberSignal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["atom"])(false);
    var $activeMemberRoleSignal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["atom"])(false);
    var roles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({
        admin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BktEfzR6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"],
        member: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BktEfzR6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"],
        owner: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BktEfzR6$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["o"]
    }, options === null || options === void 0 ? void 0 : options.roles);
    return {
        id: "organization",
        $InferServerPlugin: {},
        getActions: function($fetch, _$store, co) {
            return {
                $Infer: {
                    ActiveOrganization: {},
                    Organization: {},
                    Invitation: {},
                    Member: {},
                    Team: {}
                },
                organization: {
                    checkRolePermission: function(data) {
                        var _data_permissions;
                        return clientSideHasPermission({
                            role: data.role,
                            options: {
                                ac: options === null || options === void 0 ? void 0 : options.ac,
                                roles: roles
                            },
                            permissions: (_data_permissions = data.permissions) !== null && _data_permissions !== void 0 ? _data_permissions : data.permission
                        });
                    }
                }
            };
        },
        getAtoms: function($fetch) {
            var listOrganizations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])($listOrg, "/organization/list", $fetch, {
                method: "GET"
            });
            return {
                $listOrg: $listOrg,
                $activeOrgSignal: $activeOrgSignal,
                $activeMemberSignal: $activeMemberSignal,
                $activeMemberRoleSignal: $activeMemberRoleSignal,
                activeOrganization: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])([
                    $activeOrgSignal
                ], "/organization/get-full-organization", $fetch, {
                    "organizationClient.useAuthQuery": function() {
                        return {
                            method: "GET"
                        };
                    }
                }["organizationClient.useAuthQuery"]),
                listOrganizations: listOrganizations,
                activeMember: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])([
                    $activeMemberSignal
                ], "/organization/get-active-member", $fetch, {
                    method: "GET"
                }),
                activeMemberRole: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])([
                    $activeMemberRoleSignal
                ], "/organization/get-active-member-role", $fetch, {
                    method: "GET"
                })
            };
        },
        pathMethods: {
            "/organization/get-full-organization": "GET",
            "/organization/list-user-teams": "GET"
        },
        atomListeners: [
            {
                matcher: function matcher(path) {
                    return path === "/organization/create" || path === "/organization/delete" || path === "/organization/update";
                },
                signal: "$listOrg"
            },
            {
                matcher: function matcher(path) {
                    return path.startsWith("/organization");
                },
                signal: "$activeOrgSignal"
            },
            {
                matcher: function matcher(path) {
                    return path.startsWith("/organization/set-active");
                },
                signal: "$sessionSignal"
            },
            {
                matcher: function matcher(path) {
                    return path.includes("/organization/update-member-role");
                },
                signal: "$activeMemberSignal"
            },
            {
                matcher: function matcher(path) {
                    return path.includes("/organization/update-member-role");
                },
                signal: "$activeMemberRoleSignal"
            }
        ]
    };
};
var inferOrgAdditionalFields = function(schema) {
    return {};
};
//#endregion
//#region src/plugins/phone-number/client.ts
var phoneNumberClient = function() {
    return {
        id: "phoneNumber",
        $InferServerPlugin: {},
        atomListeners: [
            {
                matcher: function matcher(path) {
                    return path === "/phone-number/update" || path === "/phone-number/verify" || path === "/sign-in/phone-number";
                },
                signal: "$sessionSignal"
            }
        ]
    };
};
//#endregion
//#region src/plugins/siwe/client.ts
var siweClient = function() {
    return {
        id: "siwe",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/username/client.ts
var usernameClient = function() {
    return {
        id: "username",
        $InferServerPlugin: {},
        atomListeners: [
            {
                matcher: function(path) {
                    return path === "/sign-in/username";
                },
                signal: "$sessionSignal"
            }
        ]
    };
};
//#endregion
//#region src/client/plugins/infer-plugin.ts
var InferServerPlugin = function() {
    return {
        id: "infer-server-plugin",
        $InferServerPlugin: {}
    };
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client/react/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAuthClient",
    ()=>createAuthClient,
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_spread.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_spread_props.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_sliced_to_array.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$url$2d$B7VXiggp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/url-B7VXiggp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$parser$2d$g6CH$2d$tVp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/parser-g6CH-tVp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__capitalizeFirstLetter$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils-BqQC77zO.mjs [app-client] (ecmascript) <export t as capitalizeFirstLetter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$listen$2d$keys$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nanostores/listen-keys/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
//#region src/client/react/react-store.ts
/**
* Subscribe to store changes and get store's value.
*
* Can be used with store builder too.
*
* ```js
* import { useStore } from 'nanostores/react'
*
* import { router } from '../store/router'
*
* export const Layout = () => {
*   let page = useStore(router)
*   if (page.route === 'home') {
*     return <HomePage />
*   } else {
*     return <Error404 />
*   }
* }
* ```
*
* @param store Store instance.
* @returns Store value.
*/ function useStore(store) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var snapshotRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(store.get());
    var keys = options.keys, _options_deps = options.deps, deps = _options_deps === void 0 ? [
        store,
        keys
    ] : _options_deps;
    var subscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useStore.useCallback[subscribe]": function(onChange) {
            var emitChange = {
                "useStore.useCallback[subscribe].emitChange": function(value) {
                    if (snapshotRef.current === value) return;
                    snapshotRef.current = value;
                    onChange();
                }
            }["useStore.useCallback[subscribe].emitChange"];
            emitChange(store.value);
            if (keys === null || keys === void 0 ? void 0 : keys.length) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$listen$2d$keys$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listenKeys"])(store, keys, emitChange);
            return store.listen(emitChange);
        }
    }["useStore.useCallback[subscribe]"], deps);
    var get = function() {
        return snapshotRef.current;
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, get, get);
}
//#endregion
//#region src/client/react/index.ts
function getAtomKey(str) {
    return "use".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__t__as__capitalizeFirstLetter$3e$__["capitalizeFirstLetter"])(str));
}
function createAuthClient(options) {
    var _getClientConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["n"])(options), pluginPathMethods = _getClientConfig.pluginPathMethods, pluginsActions = _getClientConfig.pluginsActions, pluginsAtoms = _getClientConfig.pluginsAtoms, $fetch = _getClientConfig.$fetch, $store = _getClientConfig.$store, atomListeners = _getClientConfig.atomListeners;
    var resolvedHooks = {};
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        var _loop = function() {
            var _step_value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(_step.value, 2), key = _step_value[0], value = _step_value[1];
            resolvedHooks[getAtomKey(key)] = function() {
                return useStore(value);
            };
        };
        for(var _iterator = Object.entries(pluginsAtoms)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["t"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])({}, pluginsActions, resolvedHooks), {
        $fetch: $fetch,
        $store: $store
    }), $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-BJRbyWu7.mjs [app-client] (ecmascript) <export r as createAuthClient>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAuthClient",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2d$BJRbyWu7$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2d$BJRbyWu7$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-BJRbyWu7.mjs [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=6866a_better-auth_dist_fd4f9bae._.js.map