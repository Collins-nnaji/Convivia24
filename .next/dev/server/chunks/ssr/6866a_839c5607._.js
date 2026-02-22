module.exports = [
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env-D6s-lvJz.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "a",
    ()=>shouldPublishLog,
    "c",
    ()=>env,
    "d",
    ()=>isDevelopment,
    "f",
    ()=>isProduction,
    "i",
    ()=>logger,
    "l",
    ()=>getBooleanEnvVar,
    "m",
    ()=>nodeENV,
    "n",
    ()=>createLogger,
    "o",
    ()=>getColorDepth,
    "p",
    ()=>isTest,
    "r",
    ()=>levels,
    "s",
    ()=>ENV,
    "t",
    ()=>TTY_COLORS,
    "u",
    ()=>getEnvVar
]);
//#region src/env/env-impl.ts
const _envShim = Object.create(null);
const _getEnv = (useShim)=>globalThis.process?.env || globalThis.Deno?.env.toObject() || globalThis.__env__ || (useShim ? _envShim : globalThis);
const env = new Proxy(_envShim, {
    get (_, prop) {
        return _getEnv()[prop] ?? _envShim[prop];
    },
    has (_, prop) {
        return prop in _getEnv() || prop in _envShim;
    },
    set (_, prop, value) {
        const env$1 = _getEnv(true);
        env$1[prop] = value;
        return true;
    },
    deleteProperty (_, prop) {
        if (!prop) return false;
        const env$1 = _getEnv(true);
        delete env$1[prop];
        return true;
    },
    ownKeys () {
        const env$1 = _getEnv(true);
        return Object.keys(env$1);
    }
});
function toBoolean(val) {
    return val ? val !== "false" : false;
}
const nodeENV = typeof process !== "undefined" && process.env && ("TURBOPACK compile-time value", "development") || "";
/** Detect if `NODE_ENV` environment variable is `production` */ const isProduction = nodeENV === "production";
/** Detect if `NODE_ENV` environment variable is `dev` or `development` */ const isDevelopment = ()=>nodeENV === "dev" || nodeENV === "development";
/** Detect if `NODE_ENV` environment variable is `test` */ const isTest = ()=>nodeENV === "test" || toBoolean(env.TEST);
/**
* Get environment variable with fallback
*/ function getEnvVar(key, fallback) {
    if (typeof process !== "undefined" && process.env) return process.env[key] ?? fallback;
    if (typeof Deno !== "undefined") return Deno.env.get(key) ?? fallback;
    if (typeof Bun !== "undefined") return Bun.env[key] ?? fallback;
    return fallback;
}
/**
* Get boolean environment variable
*/ function getBooleanEnvVar(key, fallback = true) {
    const value = getEnvVar(key);
    if (!value) return fallback;
    return value !== "0" && value.toLowerCase() !== "false" && value !== "";
}
/**
* Common environment variables used in Better Auth
*/ const ENV = Object.freeze({
    get BETTER_AUTH_SECRET () {
        return getEnvVar("BETTER_AUTH_SECRET");
    },
    get AUTH_SECRET () {
        return getEnvVar("AUTH_SECRET");
    },
    get BETTER_AUTH_TELEMETRY () {
        return getEnvVar("BETTER_AUTH_TELEMETRY");
    },
    get BETTER_AUTH_TELEMETRY_ID () {
        return getEnvVar("BETTER_AUTH_TELEMETRY_ID");
    },
    get NODE_ENV () {
        return getEnvVar("NODE_ENV", "development");
    },
    get PACKAGE_VERSION () {
        return getEnvVar("PACKAGE_VERSION", "0.0.0");
    },
    get BETTER_AUTH_TELEMETRY_ENDPOINT () {
        return getEnvVar("BETTER_AUTH_TELEMETRY_ENDPOINT", "https://telemetry.better-auth.com/v1/track");
    }
});
//#endregion
//#region src/env/color-depth.ts
const COLORS_2 = 1;
const COLORS_16 = 4;
const COLORS_256 = 8;
const COLORS_16m = 24;
const TERM_ENVS = {
    eterm: COLORS_16,
    cons25: COLORS_16,
    console: COLORS_16,
    cygwin: COLORS_16,
    dtterm: COLORS_16,
    gnome: COLORS_16,
    hurd: COLORS_16,
    jfbterm: COLORS_16,
    konsole: COLORS_16,
    kterm: COLORS_16,
    mlterm: COLORS_16,
    mosh: COLORS_16m,
    putty: COLORS_16,
    st: COLORS_16,
    "rxvt-unicode-24bit": COLORS_16m,
    terminator: COLORS_16m,
    "xterm-kitty": COLORS_16m
};
const CI_ENVS_MAP = new Map(Object.entries({
    APPVEYOR: COLORS_256,
    BUILDKITE: COLORS_256,
    CIRCLECI: COLORS_16m,
    DRONE: COLORS_256,
    GITEA_ACTIONS: COLORS_16m,
    GITHUB_ACTIONS: COLORS_16m,
    GITLAB_CI: COLORS_256,
    TRAVIS: COLORS_256
}));
const TERM_ENVS_REG_EXP = [
    /ansi/,
    /color/,
    /linux/,
    /direct/,
    /^con[0-9]*x[0-9]/,
    /^rxvt/,
    /^screen/,
    /^xterm/,
    /^vt100/,
    /^vt220/
];
function getColorDepth() {
    if (getEnvVar("FORCE_COLOR") !== void 0) switch(getEnvVar("FORCE_COLOR")){
        case "":
        case "1":
        case "true":
            return COLORS_16;
        case "2":
            return COLORS_256;
        case "3":
            return COLORS_16m;
        default:
            return COLORS_2;
    }
    if (getEnvVar("NODE_DISABLE_COLORS") !== void 0 && getEnvVar("NODE_DISABLE_COLORS") !== "" || getEnvVar("NO_COLOR") !== void 0 && getEnvVar("NO_COLOR") !== "" || getEnvVar("TERM") === "dumb") return COLORS_2;
    if (getEnvVar("TMUX")) return COLORS_16m;
    if ("TF_BUILD" in env && "AGENT_NAME" in env) return COLORS_16;
    if ("CI" in env) {
        for (const { 0: envName, 1: colors } of CI_ENVS_MAP)if (envName in env) return colors;
        if (getEnvVar("CI_NAME") === "codeship") return COLORS_256;
        return COLORS_2;
    }
    if ("TEAMCITY_VERSION" in env) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.exec(getEnvVar("TEAMCITY_VERSION")) !== null ? COLORS_16 : COLORS_2;
    switch(getEnvVar("TERM_PROGRAM")){
        case "iTerm.app":
            if (!getEnvVar("TERM_PROGRAM_VERSION") || /^[0-2]\./.exec(getEnvVar("TERM_PROGRAM_VERSION")) !== null) return COLORS_256;
            return COLORS_16m;
        case "HyperTerm":
        case "MacTerm":
            return COLORS_16m;
        case "Apple_Terminal":
            return COLORS_256;
    }
    if (getEnvVar("COLORTERM") === "truecolor" || getEnvVar("COLORTERM") === "24bit") return COLORS_16m;
    if (getEnvVar("TERM")) {
        if (/truecolor/.exec(getEnvVar("TERM")) !== null) return COLORS_16m;
        if (/^xterm-256/.exec(getEnvVar("TERM")) !== null) return COLORS_256;
        const termEnv = getEnvVar("TERM").toLowerCase();
        if (TERM_ENVS[termEnv]) return TERM_ENVS[termEnv];
        if (TERM_ENVS_REG_EXP.some((term)=>term.exec(termEnv) !== null)) return COLORS_16;
    }
    if (getEnvVar("COLORTERM")) return COLORS_16;
    return COLORS_2;
}
//#endregion
//#region src/env/logger.ts
const TTY_COLORS = {
    reset: "\x1B[0m",
    bright: "\x1B[1m",
    dim: "\x1B[2m",
    undim: "\x1B[22m",
    underscore: "\x1B[4m",
    blink: "\x1B[5m",
    reverse: "\x1B[7m",
    hidden: "\x1B[8m",
    fg: {
        black: "\x1B[30m",
        red: "\x1B[31m",
        green: "\x1B[32m",
        yellow: "\x1B[33m",
        blue: "\x1B[34m",
        magenta: "\x1B[35m",
        cyan: "\x1B[36m",
        white: "\x1B[37m"
    },
    bg: {
        black: "\x1B[40m",
        red: "\x1B[41m",
        green: "\x1B[42m",
        yellow: "\x1B[43m",
        blue: "\x1B[44m",
        magenta: "\x1B[45m",
        cyan: "\x1B[46m",
        white: "\x1B[47m"
    }
};
const levels = [
    "debug",
    "info",
    "success",
    "warn",
    "error"
];
function shouldPublishLog(currentLogLevel, logLevel) {
    return levels.indexOf(logLevel) >= levels.indexOf(currentLogLevel);
}
const levelColors = {
    info: TTY_COLORS.fg.blue,
    success: TTY_COLORS.fg.green,
    warn: TTY_COLORS.fg.yellow,
    error: TTY_COLORS.fg.red,
    debug: TTY_COLORS.fg.magenta
};
const formatMessage = (level, message, colorsEnabled)=>{
    const timestamp = /* @__PURE__ */ new Date().toISOString();
    if (colorsEnabled) return `${TTY_COLORS.dim}${timestamp}${TTY_COLORS.reset} ${levelColors[level]}${level.toUpperCase()}${TTY_COLORS.reset} ${TTY_COLORS.bright}[Better Auth]:${TTY_COLORS.reset} ${message}`;
    return `${timestamp} ${level.toUpperCase()} [Better Auth]: ${message}`;
};
const createLogger = (options)=>{
    const enabled = options?.disabled !== true;
    const logLevel = options?.level ?? "error";
    const colorsEnabled = options?.disableColors !== void 0 ? !options.disableColors : getColorDepth() !== 1;
    const LogFunc = (level, message, args = [])=>{
        if (!enabled || !shouldPublishLog(logLevel, level)) return;
        const formattedMessage = formatMessage(level, message, colorsEnabled);
        if (!options || typeof options.log !== "function") {
            if (level === "error") console.error(formattedMessage, ...args);
            else if (level === "warn") console.warn(formattedMessage, ...args);
            else console.log(formattedMessage, ...args);
            return;
        }
        options.log(level === "success" ? "info" : level, message, ...args);
    };
    return {
        ...Object.fromEntries(levels.map((level)=>[
                level,
                (...[message, ...args])=>LogFunc(level, message, args)
            ])),
        get level () {
            return logLevel;
        }
    };
};
const logger = createLogger();
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env/index.mjs [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env-D6s-lvJz.mjs [app-ssr] (ecmascript)");
;
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env-D6s-lvJz.mjs [app-ssr] (ecmascript) <export c as env>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "env",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["c"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env-D6s-lvJz.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils-BqQC77zO.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "i",
    ()=>defineErrorCodes,
    "n",
    ()=>safeJSONParse,
    "r",
    ()=>generateId,
    "t",
    ()=>capitalizeFirstLetter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env-D6s-lvJz.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$random$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@better-auth/utils/dist/random.mjs [app-ssr] (ecmascript)");
;
;
//#region src/utils/error-codes.ts
function defineErrorCodes(codes) {
    return codes;
}
//#endregion
//#region src/utils/id.ts
const generateId = (size)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$better$2d$auth$2f$utils$2f$dist$2f$random$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createRandomStringGenerator"])("a-z", "A-Z", "0-9")(size || 32);
};
//#endregion
//#region src/utils/json.ts
function safeJSONParse(data) {
    function reviver(_, value) {
        if (typeof value === "string") {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
                const date = new Date(value);
                if (!isNaN(date.getTime())) return date;
            }
        }
        return value;
    }
    try {
        if (typeof data !== "string") return data;
        return JSON.parse(data, reviver);
    } catch (e) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["i"].error("Error parsing JSON", {
            error: e
        });
        return null;
    }
}
//#endregion
//#region src/utils/string.ts
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error-CMXuwPsa.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "n",
    ()=>BASE_ERROR_CODES,
    "t",
    ()=>BetterAuthError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils-BqQC77zO.mjs [app-ssr] (ecmascript)");
;
//#region src/error/codes.ts
const BASE_ERROR_CODES = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["i"])({
    USER_NOT_FOUND: "User not found",
    FAILED_TO_CREATE_USER: "Failed to create user",
    FAILED_TO_CREATE_SESSION: "Failed to create session",
    FAILED_TO_UPDATE_USER: "Failed to update user",
    FAILED_TO_GET_SESSION: "Failed to get session",
    INVALID_PASSWORD: "Invalid password",
    INVALID_EMAIL: "Invalid email",
    INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
    SOCIAL_ACCOUNT_ALREADY_LINKED: "Social account already linked",
    PROVIDER_NOT_FOUND: "Provider not found",
    INVALID_TOKEN: "Invalid token",
    ID_TOKEN_NOT_SUPPORTED: "id_token not supported",
    FAILED_TO_GET_USER_INFO: "Failed to get user info",
    USER_EMAIL_NOT_FOUND: "User email not found",
    EMAIL_NOT_VERIFIED: "Email not verified",
    PASSWORD_TOO_SHORT: "Password too short",
    PASSWORD_TOO_LONG: "Password too long",
    USER_ALREADY_EXISTS: "User already exists.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "User already exists. Use another email.",
    EMAIL_CAN_NOT_BE_UPDATED: "Email can not be updated",
    CREDENTIAL_ACCOUNT_NOT_FOUND: "Credential account not found",
    SESSION_EXPIRED: "Session expired. Re-authenticate to perform this action.",
    FAILED_TO_UNLINK_LAST_ACCOUNT: "You can't unlink your last account",
    ACCOUNT_NOT_FOUND: "Account not found",
    USER_ALREADY_HAS_PASSWORD: "User already has a password. Provide that to delete the account."
});
//#endregion
//#region src/error/index.ts
var BetterAuthError = class extends Error {
    constructor(message, cause){
        super(message);
        this.name = "BetterAuthError";
        this.message = message;
        this.cause = cause;
        this.stack = "";
    }
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error/index.mjs [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env-D6s-lvJz.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils-BqQC77zO.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error-CMXuwPsa.mjs [app-ssr] (ecmascript)");
;
;
;
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error-CMXuwPsa.mjs [app-ssr] (ecmascript) <export t as BetterAuthError>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BetterAuthError",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error-CMXuwPsa.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils/index.mjs [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env-D6s-lvJz.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils-BqQC77zO.mjs [app-ssr] (ecmascript)");
;
;
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils-BqQC77zO.mjs [app-ssr] (ecmascript) <export t as capitalizeFirstLetter>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "capitalizeFirstLetter",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils-BqQC77zO.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/url-B7VXiggp.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/env-D6s-lvJz.mjs [app-ssr] (ecmascript) <export c as env>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error-CMXuwPsa.mjs [app-ssr] (ecmascript) <export t as BetterAuthError>");
;
;
//#region src/utils/url.ts
function checkHasPath(url) {
    try {
        return (new URL(url).pathname.replace(/\/+$/, "") || "/") !== "/";
    } catch (error) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"](`Invalid base URL: ${url}. Please provide a valid base URL.`);
    }
}
function assertHasProtocol(url) {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"](`Invalid base URL: ${url}. URL must include 'http://' or 'https://'`);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"]) throw error;
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"](`Invalid base URL: ${url}. Please provide a valid base URL.`, String(error));
    }
}
function withPath(url, path = "/api/auth") {
    assertHasProtocol(url);
    if (checkHasPath(url)) return url;
    const trimmedUrl = url.replace(/\/+$/, "");
    if (!path || path === "/") return trimmedUrl;
    path = path.startsWith("/") ? path : `/${path}`;
    return `${trimmedUrl}${path}`;
}
function getBaseURL(url, path, request, loadEnv, trustedProxyHeaders) {
    if (url) return withPath(url, path);
    if (loadEnv !== false) {
        const fromEnv = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].BETTER_AUTH_URL || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].NEXT_PUBLIC_BETTER_AUTH_URL || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].PUBLIC_BETTER_AUTH_URL || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].NUXT_PUBLIC_BETTER_AUTH_URL || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].NUXT_PUBLIC_AUTH_URL || (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].BASE_URL !== "/" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$env$2d$D6s$2d$lvJz$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__c__as__env$3e$__["env"].BASE_URL : void 0);
        if (fromEnv) return withPath(fromEnv, path);
    }
    const fromRequest = request?.headers.get("x-forwarded-host");
    const fromRequestProto = request?.headers.get("x-forwarded-proto");
    if (fromRequest && fromRequestProto && trustedProxyHeaders) return withPath(`${fromRequestProto}://${fromRequest}`, path);
    if (request) {
        const url$1 = getOrigin(request.url);
        if (!url$1) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"]("Could not get origin from request. Please provide a valid base URL.");
        return withPath(url$1, path);
    }
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
}
function getOrigin(url) {
    try {
        const parsedUrl = new URL(url);
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
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/parser-g6CH-tVp.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "t",
    ()=>parseJSON
]);
//#region src/client/parser.ts
const PROTO_POLLUTION_PATTERNS = {
    proto: /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
    constructor: /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
    protoShort: /"__proto__"\s*:/,
    constructorShort: /"constructor"\s*:/
};
const JSON_SIGNATURE = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
const SPECIAL_VALUES = {
    true: true,
    false: false,
    null: null,
    undefined: void 0,
    nan: NaN,
    infinity: Number.POSITIVE_INFINITY,
    "-infinity": Number.NEGATIVE_INFINITY
};
const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;
function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
}
function parseISODate(value) {
    const match = ISO_DATE_REGEX.exec(value);
    if (!match) return null;
    const [, year, month, day, hour, minute, second, ms, offsetSign, offsetHour, offsetMinute] = match;
    let date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), ms ? parseInt(ms.padEnd(3, "0"), 10) : 0));
    if (offsetSign) {
        const offset = (parseInt(offsetHour, 10) * 60 + parseInt(offsetMinute, 10)) * (offsetSign === "+" ? -1 : 1);
        date.setUTCMinutes(date.getUTCMinutes() + offset);
    }
    return isValidDate(date) ? date : null;
}
function betterJSONParse(value, options = {}) {
    const { strict = false, warnings = false, reviver, parseDates = true } = options;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (trimmed.length > 0 && trimmed[0] === "\"" && trimmed.endsWith("\"") && !trimmed.slice(1, -1).includes("\"")) return trimmed.slice(1, -1);
    const lowerValue = trimmed.toLowerCase();
    if (lowerValue.length <= 9 && lowerValue in SPECIAL_VALUES) return SPECIAL_VALUES[lowerValue];
    if (!JSON_SIGNATURE.test(trimmed)) {
        if (strict) throw new SyntaxError("[better-json] Invalid JSON");
        return value;
    }
    if (Object.entries(PROTO_POLLUTION_PATTERNS).some(([key, pattern])=>{
        const matches = pattern.test(trimmed);
        if (matches && warnings) console.warn(`[better-json] Detected potential prototype pollution attempt using ${key} pattern`);
        return matches;
    }) && strict) throw new Error("[better-json] Potential prototype pollution attempt detected");
    try {
        const secureReviver = (key, value$1)=>{
            if (key === "__proto__" || key === "constructor" && value$1 && typeof value$1 === "object" && "prototype" in value$1) {
                if (warnings) console.warn(`[better-json] Dropping "${key}" key to prevent prototype pollution`);
                return;
            }
            if (parseDates && typeof value$1 === "string") {
                const date = parseISODate(value$1);
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
function parseJSON(value, options = {
    strict: true
}) {
    return betterJSONParse(value, options);
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$url$2d$B7VXiggp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/url-B7VXiggp.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$parser$2d$g6CH$2d$tVp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/parser-g6CH-tVp.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nanostores/atom/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$lifecycle$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nanostores/lifecycle/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$fetch$2f$fetch$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-fetch/fetch/dist/index.js [app-ssr] (ecmascript)");
;
;
;
;
//#region src/client/broadcast-channel.ts
const kBroadcastChannel = Symbol.for("better-auth:broadcast-channel");
const now$1 = ()=>Math.floor(Date.now() / 1e3);
var WindowBroadcastChannel = class {
    listeners = /* @__PURE__ */ new Set();
    name;
    constructor(name = "better-auth.message"){
        this.name = name;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return ()=>{
            this.listeners.delete(listener);
        };
    }
    post(message) {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
    setup() {
        if ("TURBOPACK compile-time truthy", 1) return ()=>{};
        //TURBOPACK unreachable
        ;
        const handler = undefined;
    }
};
function getGlobalBroadcastChannel(name = "better-auth.message") {
    if (!globalThis[kBroadcastChannel]) globalThis[kBroadcastChannel] = new WindowBroadcastChannel(name);
    return globalThis[kBroadcastChannel];
}
//#endregion
//#region src/client/focus-manager.ts
const kFocusManager = Symbol.for("better-auth:focus-manager");
var WindowFocusManager = class {
    listeners = /* @__PURE__ */ new Set();
    subscribe(listener) {
        this.listeners.add(listener);
        return ()=>{
            this.listeners.delete(listener);
        };
    }
    setFocused(focused) {
        this.listeners.forEach((listener)=>listener(focused));
    }
    setup() {
        if ("TURBOPACK compile-time truthy", 1) return ()=>{};
        //TURBOPACK unreachable
        ;
        const visibilityHandler = undefined;
    }
};
function getGlobalFocusManager() {
    if (!globalThis[kFocusManager]) globalThis[kFocusManager] = new WindowFocusManager();
    return globalThis[kFocusManager];
}
//#endregion
//#region src/client/online-manager.ts
const kOnlineManager = Symbol.for("better-auth:online-manager");
var WindowOnlineManager = class {
    listeners = /* @__PURE__ */ new Set();
    isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    subscribe(listener) {
        this.listeners.add(listener);
        return ()=>{
            this.listeners.delete(listener);
        };
    }
    setOnline(online) {
        this.isOnline = online;
        this.listeners.forEach((listener)=>listener(online));
    }
    setup() {
        if ("TURBOPACK compile-time truthy", 1) return ()=>{};
        //TURBOPACK unreachable
        ;
        const onOnline = undefined;
        const onOffline = undefined;
    }
};
function getGlobalOnlineManager() {
    if (!globalThis[kOnlineManager]) globalThis[kOnlineManager] = new WindowOnlineManager();
    return globalThis[kOnlineManager];
}
//#endregion
//#region src/client/query.ts
const isServer = ()=>("TURBOPACK compile-time value", "undefined") === "undefined";
const useAuthQuery = (initializedAtom, path, $fetch, options)=>{
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["atom"])({
        data: null,
        error: null,
        isPending: true,
        isRefetching: false,
        refetch: (queryParams)=>fn(queryParams)
    });
    const fn = async (queryParams)=>{
        return new Promise((resolve)=>{
            const opts = typeof options === "function" ? options({
                data: value.get().data,
                error: value.get().error,
                isPending: value.get().isPending
            }) : options;
            $fetch(path, {
                ...opts,
                query: {
                    ...opts?.query,
                    ...queryParams?.query
                },
                async onSuccess (context) {
                    value.set({
                        data: context.data,
                        error: null,
                        isPending: false,
                        isRefetching: false,
                        refetch: value.value.refetch
                    });
                    await opts?.onSuccess?.(context);
                },
                async onError (context) {
                    const { request } = context;
                    const retryAttempts = typeof request.retry === "number" ? request.retry : request.retry?.attempts;
                    const retryAttempt = request.retryAttempt || 0;
                    if (retryAttempts && retryAttempt < retryAttempts) return;
                    value.set({
                        error: context.error,
                        data: null,
                        isPending: false,
                        isRefetching: false,
                        refetch: value.value.refetch
                    });
                    await opts?.onError?.(context);
                },
                async onRequest (context) {
                    const currentValue = value.get();
                    value.set({
                        isPending: currentValue.data === null,
                        data: currentValue.data,
                        error: null,
                        isRefetching: true,
                        refetch: value.value.refetch
                    });
                    await opts?.onRequest?.(context);
                }
            }).catch((error)=>{
                value.set({
                    error,
                    data: null,
                    isPending: false,
                    isRefetching: false,
                    refetch: value.value.refetch
                });
            }).finally(()=>{
                resolve(void 0);
            });
        });
    };
    initializedAtom = Array.isArray(initializedAtom) ? initializedAtom : [
        initializedAtom
    ];
    let isMounted = false;
    for (const initAtom of initializedAtom)initAtom.subscribe(async ()=>{
        if (isServer()) return;
        //TURBOPACK unreachable
        ;
    });
    return value;
};
//#endregion
//#region src/client/session-refresh.ts
const now = ()=>Math.floor(Date.now() / 1e3);
/**
* Rate limit: don't refetch on focus if a session request was made within this many seconds
*/ const FOCUS_REFETCH_RATE_LIMIT_SECONDS = 5;
function createSessionRefreshManager(opts) {
    const { sessionAtom, sessionSignal, $fetch, options = {} } = opts;
    const refetchInterval = options.sessionOptions?.refetchInterval ?? 0;
    const refetchOnWindowFocus = options.sessionOptions?.refetchOnWindowFocus ?? true;
    const refetchWhenOffline = options.sessionOptions?.refetchWhenOffline ?? false;
    const state = {
        lastSync: 0,
        lastSessionRequest: 0,
        cachedSession: void 0
    };
    const shouldRefetch = ()=>{
        return refetchWhenOffline || getGlobalOnlineManager().isOnline;
    };
    const triggerRefetch = (event)=>{
        if (!shouldRefetch()) return;
        if (event?.event === "storage") {
            state.lastSync = now();
            sessionSignal.set(!sessionSignal.get());
            return;
        }
        const currentSession = sessionAtom.get();
        if (event?.event === "poll") {
            state.lastSessionRequest = now();
            $fetch("/get-session").then((res)=>{
                sessionAtom.set({
                    ...currentSession,
                    data: res.data,
                    error: res.error || null
                });
                state.lastSync = now();
                sessionSignal.set(!sessionSignal.get());
            }).catch(()=>{});
            return;
        }
        if (event?.event === "visibilitychange") {
            if (now() - state.lastSessionRequest < FOCUS_REFETCH_RATE_LIMIT_SECONDS && currentSession?.data !== null && currentSession?.data !== void 0) return;
        }
        if (currentSession?.data === null || currentSession?.data === void 0 || event?.event === "visibilitychange") {
            if (event?.event === "visibilitychange") state.lastSessionRequest = now();
            state.lastSync = now();
            sessionSignal.set(!sessionSignal.get());
        }
    };
    const broadcastSessionUpdate = (trigger)=>{
        getGlobalBroadcastChannel().post({
            event: "session",
            data: {
                trigger
            },
            clientId: Math.random().toString(36).substring(7)
        });
    };
    const setupPolling = ()=>{
        if (refetchInterval && refetchInterval > 0) state.pollInterval = setInterval(()=>{
            if (sessionAtom.get()?.data) triggerRefetch({
                event: "poll"
            });
        }, refetchInterval * 1e3);
    };
    const setupBroadcast = ()=>{
        state.unsubscribeBroadcast = getGlobalBroadcastChannel().subscribe(()=>{
            triggerRefetch({
                event: "storage"
            });
        });
    };
    const setupFocusRefetch = ()=>{
        if (!refetchOnWindowFocus) return;
        state.unsubscribeFocus = getGlobalFocusManager().subscribe(()=>{
            triggerRefetch({
                event: "visibilitychange"
            });
        });
    };
    const setupOnlineRefetch = ()=>{
        state.unsubscribeOnline = getGlobalOnlineManager().subscribe((online)=>{
            if (online) triggerRefetch({
                event: "visibilitychange"
            });
        });
    };
    const init = ()=>{
        setupPolling();
        setupBroadcast();
        setupFocusRefetch();
        setupOnlineRefetch();
        getGlobalBroadcastChannel().setup();
        getGlobalFocusManager().setup();
        getGlobalOnlineManager().setup();
    };
    const cleanup = ()=>{
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
        init,
        cleanup,
        triggerRefetch,
        broadcastSessionUpdate
    };
}
//#endregion
//#region src/client/fetch-plugins.ts
const redirectPlugin = {
    id: "redirect",
    name: "Redirect",
    hooks: {
        onSuccess (context) {
            if (context.data?.url && context.data?.redirect) {
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
            }
        }
    }
};
//#endregion
//#region src/client/session-atom.ts
function getSessionAtom($fetch, options) {
    const $signal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["atom"])(false);
    const session = useAuthQuery($signal, "/get-session", $fetch, {
        method: "GET"
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$lifecycle$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onMount"])(session, ()=>{
        const refreshManager = createSessionRefreshManager({
            sessionAtom: session,
            sessionSignal: $signal,
            $fetch,
            options
        });
        refreshManager.init();
        return ()=>{
            refreshManager.cleanup();
        };
    });
    return {
        session,
        $sessionSignal: $signal
    };
}
//#endregion
//#region src/client/config.ts
const getClientConfig = (options, loadEnv)=>{
    const isCredentialsSupported = "credentials" in Request.prototype;
    const baseURL = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$url$2d$B7VXiggp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(options?.baseURL, options?.basePath, void 0, loadEnv) ?? "/api/auth";
    const pluginsFetchPlugins = options?.plugins?.flatMap((plugin)=>plugin.fetchPlugins).filter((pl)=>pl !== void 0) || [];
    const lifeCyclePlugin = {
        id: "lifecycle-hooks",
        name: "lifecycle-hooks",
        hooks: {
            onSuccess: options?.fetchOptions?.onSuccess,
            onError: options?.fetchOptions?.onError,
            onRequest: options?.fetchOptions?.onRequest,
            onResponse: options?.fetchOptions?.onResponse
        }
    };
    const { onSuccess, onError, onRequest, onResponse, ...restOfFetchOptions } = options?.fetchOptions || {};
    const $fetch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$fetch$2f$fetch$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createFetch"])({
        baseURL,
        ...isCredentialsSupported ? {
            credentials: "include"
        } : {},
        method: "GET",
        jsonParser (text) {
            if (!text) return null;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$parser$2d$g6CH$2d$tVp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(text, {
                strict: false
            });
        },
        customFetchImpl: fetch,
        ...restOfFetchOptions,
        plugins: [
            lifeCyclePlugin,
            ...restOfFetchOptions.plugins || [],
            ...options?.disableDefaultFetchPlugins ? [] : [
                redirectPlugin
            ],
            ...pluginsFetchPlugins
        ]
    });
    const { $sessionSignal, session } = getSessionAtom($fetch, options);
    const plugins = options?.plugins || [];
    let pluginsActions = {};
    let pluginsAtoms = {
        $sessionSignal,
        session
    };
    let pluginPathMethods = {
        "/sign-out": "POST",
        "/revoke-sessions": "POST",
        "/revoke-other-sessions": "POST",
        "/delete-user": "POST"
    };
    const atomListeners = [
        {
            signal: "$sessionSignal",
            matcher (path) {
                return path === "/sign-out" || path === "/update-user" || path === "/sign-up/email" || path === "/sign-in/email" || path === "/delete-user" || path === "/verify-email" || path === "/revoke-sessions" || path === "/revoke-session" || path === "/change-email";
            }
        }
    ];
    for (const plugin of plugins){
        if (plugin.getAtoms) Object.assign(pluginsAtoms, plugin.getAtoms?.($fetch));
        if (plugin.pathMethods) Object.assign(pluginPathMethods, plugin.pathMethods);
        if (plugin.atomListeners) atomListeners.push(...plugin.atomListeners);
    }
    const $store = {
        notify: (signal)=>{
            pluginsAtoms[signal].set(!pluginsAtoms[signal].get());
        },
        listen: (signal, listener)=>{
            pluginsAtoms[signal].subscribe(listener);
        },
        atoms: pluginsAtoms
    };
    for (const plugin of plugins)if (plugin.getActions) Object.assign(pluginsActions, plugin.getActions?.($fetch, $store, options));
    return {
        get baseURL () {
            return baseURL;
        },
        pluginsActions,
        pluginsAtoms,
        pluginPathMethods,
        atomListeners,
        $fetch,
        $store
    };
};
//#endregion
//#region src/utils/is-atom.ts
function isAtom(value) {
    return typeof value === "object" && value !== null && "get" in value && typeof value.get === "function" && "lc" in value && typeof value.lc === "number";
}
//#endregion
//#region src/client/proxy.ts
function getMethod(path, knownPathMethods, args) {
    const method = knownPathMethods[path];
    const { fetchOptions, query, ...body } = args || {};
    if (method) return method;
    if (fetchOptions?.method) return fetchOptions.method;
    if (body && Object.keys(body).length > 0) return "POST";
    return "GET";
}
function createDynamicPathProxy(routes, client, knownPathMethods, atoms, atomListeners) {
    function createProxy(path = []) {
        return new Proxy(function() {}, {
            get (_, prop) {
                if (typeof prop !== "string") return;
                if (prop === "then" || prop === "catch" || prop === "finally") return;
                const fullPath = [
                    ...path,
                    prop
                ];
                let current = routes;
                for (const segment of fullPath)if (current && typeof current === "object" && segment in current) current = current[segment];
                else {
                    current = void 0;
                    break;
                }
                if (typeof current === "function") return current;
                if (isAtom(current)) return current;
                return createProxy(fullPath);
            },
            apply: async (_, __, args)=>{
                const routePath = "/" + path.map((segment)=>segment.replace(/[A-Z]/g, (letter)=>`-${letter.toLowerCase()}`)).join("/");
                const arg = args[0] || {};
                const fetchOptions = args[1] || {};
                const { query, fetchOptions: argFetchOptions, ...body } = arg;
                const options = {
                    ...fetchOptions,
                    ...argFetchOptions
                };
                const method = getMethod(routePath, knownPathMethods, arg);
                return await client(routePath, {
                    ...options,
                    body: method === "GET" ? void 0 : {
                        ...body,
                        ...options?.body || {}
                    },
                    query: query || options?.query,
                    method,
                    async onSuccess (context) {
                        await options?.onSuccess?.(context);
                        if (!atomListeners || options.disableSignal) return;
                        /**
						* We trigger listeners
						*/ const matches = atomListeners.filter((s)=>s.matcher(routePath));
                        if (!matches.length) return;
                        for (const match of matches){
                            const signal = atoms[match.signal];
                            if (!signal) return;
                            /**
							* To avoid race conditions we set the signal in a setTimeout
							*/ const val = signal.get();
                            setTimeout(()=>{
                                signal.set(!val);
                            }, 10);
                        }
                    }
                });
            }
        });
    }
    return createProxy();
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-BJRbyWu7.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "n",
    ()=>InferPlugin,
    "r",
    ()=>createAuthClient,
    "t",
    ()=>InferAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__capitalizeFirstLetter$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils-BqQC77zO.mjs [app-ssr] (ecmascript) <export t as capitalizeFirstLetter>");
;
;
//#region src/client/vanilla.ts
function createAuthClient(options) {
    const { pluginPathMethods, pluginsActions, pluginsAtoms, $fetch, atomListeners, $store } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["n"])(options);
    let resolvedHooks = {};
    for (const [key, value] of Object.entries(pluginsAtoms))resolvedHooks[`use${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__capitalizeFirstLetter$3e$__["capitalizeFirstLetter"])(key)}`] = value;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])({
        ...pluginsActions,
        ...resolvedHooks,
        $fetch,
        $store
    }, $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
//#endregion
//#region src/client/index.ts
const InferPlugin = ()=>{
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
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client/index.mjs [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$url$2d$B7VXiggp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/url-B7VXiggp.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$parser$2d$g6CH$2d$tVp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/parser-g6CH-tVp.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2d$BJRbyWu7$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-BJRbyWu7.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-ssr] (ecmascript) <export s as getGlobalBroadcastChannel>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGlobalBroadcastChannel",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["s"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BCQibqkF.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "n",
    ()=>role,
    "t",
    ()=>createAccessControl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/error-CMXuwPsa.mjs [app-ssr] (ecmascript) <export t as BetterAuthError>");
;
//#region src/plugins/access/access.ts
function role(statements) {
    return {
        authorize (request, connector = "AND") {
            let success = false;
            for (const [requestedResource, requestedActions] of Object.entries(request)){
                const allowedActions = statements[requestedResource];
                if (!allowedActions) return {
                    success: false,
                    error: `You are not allowed to access resource: ${requestedResource}`
                };
                if (Array.isArray(requestedActions)) success = requestedActions.every((requestedAction)=>allowedActions.includes(requestedAction));
                else if (typeof requestedActions === "object") {
                    const actions = requestedActions;
                    if (actions.connector === "OR") success = actions.actions.some((requestedAction)=>allowedActions.includes(requestedAction));
                    else success = actions.actions.every((requestedAction)=>allowedActions.includes(requestedAction));
                } else throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$error$2d$CMXuwPsa$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__BetterAuthError$3e$__["BetterAuthError"]("Invalid access control request");
                if (success && connector === "OR") return {
                    success
                };
                if (!success && connector === "AND") return {
                    success: false,
                    error: `unauthorized to access resource "${requestedResource}"`
                };
            }
            if (success) return {
                success
            };
            return {
                success: false,
                error: "Not authorized"
            };
        },
        statements
    };
}
function createAccessControl(s) {
    return {
        newRole (statements) {
            return role(statements);
        },
        statements: s
    };
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-DZRRE6Tq.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BCQibqkF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BCQibqkF.mjs [app-ssr] (ecmascript)");
;
//#region src/plugins/admin/access/statement.ts
const defaultStatements = {
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
const defaultAc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BCQibqkF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(defaultStatements);
const adminAc = defaultAc.newRole({
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
const userAc = defaultAc.newRole({
    user: [],
    session: []
});
const defaultRoles = {
    admin: adminAc,
    user: userAc
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/has-permission-BxveqtYZ.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "t",
    ()=>hasPermission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$DZRRE6Tq$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-DZRRE6Tq.mjs [app-ssr] (ecmascript)");
;
//#region src/plugins/admin/has-permission.ts
const hasPermission = (input)=>{
    if (input.userId && input.options?.adminUserIds?.includes(input.userId)) return true;
    if (!input.permissions && !input.permission) return false;
    const roles = (input.role || input.options?.defaultRole || "user").split(",");
    const acRoles = input.options?.roles || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$DZRRE6Tq$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["r"];
    for (const role of roles)if (acRoles[role]?.authorize(input.permission ?? input.permissions)?.success) return true;
    return false;
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BktEfzR6.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BCQibqkF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BCQibqkF.mjs [app-ssr] (ecmascript)");
;
//#region src/plugins/organization/access/statement.ts
const defaultStatements = {
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
const defaultAc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BCQibqkF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(defaultStatements);
const adminAc = defaultAc.newRole({
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
const ownerAc = defaultAc.newRole({
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
const memberAc = defaultAc.newRole({
    organization: [],
    member: [],
    invitation: [],
    team: [],
    ac: [
        "read"
    ]
});
const defaultRoles = {
    admin: adminAc,
    owner: ownerAc,
    member: memberAc
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/permission-BZUPzNK6.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "n",
    ()=>hasPermissionFn,
    "t",
    ()=>cacheAllRoles
]);
//#region src/plugins/organization/permission.ts
const hasPermissionFn = (input, acRoles)=>{
    if (!input.permissions && !input.permission) return false;
    const roles = input.role.split(",");
    const creatorRole = input.options.creatorRole || "owner";
    const isCreator = roles.includes(creatorRole);
    const allowCreatorsAllPermissions = input.allowCreatorAllPermissions || false;
    if (isCreator && allowCreatorsAllPermissions) return true;
    for (const role of roles)if (acRoles[role]?.authorize(input.permissions ?? input.permission)?.success) return true;
    return false;
};
let cacheAllRoles = /* @__PURE__ */ new Map();
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-7xkXfvW4.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "t",
    ()=>twoFactorClient
]);
//#region src/plugins/two-factor/client.ts
const twoFactorClient = (options)=>{
    return {
        id: "two-factor",
        $InferServerPlugin: {},
        atomListeners: [
            {
                matcher: (path)=>path.startsWith("/two-factor/"),
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
                    async onSuccess (context) {
                        if (context.data?.twoFactorRedirect) {
                            if (options?.onTwoFactorRedirect) await options.onTwoFactorRedirect();
                        }
                    }
                }
            }
        ]
    };
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client/plugins/index.mjs [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$url$2d$B7VXiggp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/url-B7VXiggp.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$parser$2d$g6CH$2d$tVp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/parser-g6CH-tVp.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2d$BJRbyWu7$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-BJRbyWu7.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BCQibqkF$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BCQibqkF.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$DZRRE6Tq$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-DZRRE6Tq.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$has$2d$permission$2d$BxveqtYZ$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/has-permission-BxveqtYZ.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BktEfzR6$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/access-BktEfzR6.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$permission$2d$BZUPzNK6$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/permission-BZUPzNK6.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2d$7xkXfvW4$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-7xkXfvW4.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nanostores/atom/index.js [app-ssr] (ecmascript)");
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
const inferAdditionalFields = (schema)=>{
    return {
        id: "additional-fields-client",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/admin/client.ts
const adminClient = (options)=>{
    const roles = {
        admin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$DZRRE6Tq$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"],
        user: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$DZRRE6Tq$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["a"],
        ...options?.roles
    };
    return {
        id: "admin-client",
        $InferServerPlugin: {},
        getActions: ()=>({
                admin: {
                    checkRolePermission: (data)=>{
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$has$2d$permission$2d$BxveqtYZ$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])({
                            role: data.role,
                            options: {
                                ac: options?.ac,
                                roles
                            },
                            permissions: data.permissions ?? data.permission
                        });
                    }
                }
            }),
        pathMethods: {
            "/admin/list-users": "GET",
            "/admin/stop-impersonating": "POST"
        }
    };
};
//#endregion
//#region src/plugins/anonymous/client.ts
const anonymousClient = ()=>{
    return {
        id: "anonymous",
        $InferServerPlugin: {},
        pathMethods: {
            "/sign-in/anonymous": "POST"
        },
        atomListeners: [
            {
                matcher: (path)=>path === "/sign-in/anonymous",
                signal: "$sessionSignal"
            }
        ]
    };
};
//#endregion
//#region src/plugins/api-key/client.ts
const apiKeyClient = ()=>{
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
const customSessionClient = ()=>{
    return InferServerPlugin();
};
//#endregion
//#region src/plugins/device-authorization/client.ts
const deviceAuthorizationClient = ()=>{
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
const emailOTPClient = ()=>{
    return {
        id: "email-otp",
        $InferServerPlugin: {},
        atomListeners: [
            {
                matcher: (path)=>path === "/email-otp/verify-email" || path === "/sign-in/email-otp",
                signal: "$sessionSignal"
            }
        ]
    };
};
//#endregion
//#region src/plugins/generic-oauth/client.ts
const genericOAuthClient = ()=>{
    return {
        id: "generic-oauth-client",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/jwt/client.ts
const jwtClient = (options)=>{
    const jwksPath = options?.jwks?.jwksPath ?? "/jwks";
    return {
        id: "better-auth-client",
        $InferServerPlugin: {},
        pathMethods: {
            [jwksPath]: "GET"
        },
        getActions: ($fetch)=>({
                jwks: async (fetchOptions)=>{
                    return await $fetch(jwksPath, {
                        method: "GET",
                        ...fetchOptions
                    });
                }
            })
    };
};
//#endregion
//#region src/plugins/last-login-method/client.ts
function getCookieValue(name) {
    if (typeof document === "undefined") return null;
    const cookie = document.cookie.split("; ").find((row)=>row.startsWith(`${name}=`));
    return cookie ? cookie.split("=")[1] : null;
}
/**
* Client-side plugin to retrieve the last used login method
*/ const lastLoginMethodClient = (config = {})=>{
    const cookieName = config.cookieName || "better-auth.last_used_login_method";
    return {
        id: "last-login-method-client",
        getActions () {
            return {
                getLastUsedLoginMethod: ()=>{
                    return getCookieValue(cookieName);
                },
                clearLastUsedLoginMethod: ()=>{
                    if (typeof document !== "undefined") document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                },
                isLastUsedLoginMethod: (method)=>{
                    return getCookieValue(cookieName) === method;
                }
            };
        }
    };
};
//#endregion
//#region src/plugins/magic-link/client.ts
const magicLinkClient = ()=>{
    return {
        id: "magic-link",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/multi-session/client.ts
const multiSessionClient = (options)=>{
    return {
        id: "multi-session",
        $InferServerPlugin: {},
        atomListeners: [
            {
                matcher (path) {
                    return path === "/multi-session/set-active";
                },
                signal: "$sessionSignal"
            }
        ]
    };
};
//#endregion
//#region src/plugins/oidc-provider/client.ts
const oidcClient = ()=>{
    return {
        id: "oidc-client",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/one-tap/client.ts
let isRequestInProgress = null;
function isFedCMSupported() {
    return ("TURBOPACK compile-time value", "undefined") !== "undefined" && "IdentityCredential" in window;
}
const oneTapClient = (options)=>{
    return {
        id: "one-tap",
        fetchPlugins: [
            {
                id: "fedcm-signout-handle",
                name: "FedCM Sign-Out Handler",
                hooks: {
                    async onResponse (ctx) {
                        if (!ctx.request.url.toString().includes("/sign-out")) return;
                        if (options.promptOptions?.fedCM === false || !isFedCMSupported()) return;
                        //TURBOPACK unreachable
                        ;
                    }
                }
            }
        ],
        getActions: ($fetch, _)=>{
            return {
                oneTap: async (opts, fetchOptions)=>{
                    if (isRequestInProgress && !isRequestInProgress.signal.aborted) {
                        console.warn("A Google One Tap request is already in progress. Please wait.");
                        return;
                    }
                    if ("TURBOPACK compile-time truthy", 1) {
                        console.warn("Google One Tap is only available in browser environments");
                        return;
                    }
                    //TURBOPACK unreachable
                    ;
                    async function callback(idToken) {
                        await $fetch("/one-tap/callback", {
                            method: "POST",
                            body: {
                                idToken
                            },
                            ...opts?.fetchOptions,
                            ...fetchOptions
                        });
                        if (!opts?.fetchOptions && !fetchOptions || opts?.callbackURL) window.location.href = opts?.callbackURL ?? "/";
                    }
                    const autoSelect = undefined, cancelOnTapOutside = undefined, context = undefined;
                    const contextValue = undefined;
                    const clients = undefined;
                }
            };
        },
        getAtoms ($fetch) {
            return {};
        }
    };
};
const loadGoogleScript = ()=>{
    return new Promise((resolve)=>{
        if (window.googleScriptInitialized) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = ()=>{
            window.googleScriptInitialized = true;
            resolve();
        };
        document.head.appendChild(script);
    });
};
//#endregion
//#region src/plugins/one-time-token/client.ts
const oneTimeTokenClient = ()=>{
    return {
        id: "one-time-token",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/organization/client.ts
/**
* Using the same `hasPermissionFn` function, but without the need for a `ctx` parameter or the `organizationId` parameter.
*/ const clientSideHasPermission = (input)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$permission$2d$BZUPzNK6$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["n"])(input, input.options.roles || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BktEfzR6$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["r"]);
};
const organizationClient = (options)=>{
    const $listOrg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["atom"])(false);
    const $activeOrgSignal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["atom"])(false);
    const $activeMemberSignal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["atom"])(false);
    const $activeMemberRoleSignal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$atom$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["atom"])(false);
    const roles = {
        admin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BktEfzR6$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"],
        member: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BktEfzR6$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["a"],
        owner: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$access$2d$BktEfzR6$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["o"],
        ...options?.roles
    };
    return {
        id: "organization",
        $InferServerPlugin: {},
        getActions: ($fetch, _$store, co)=>({
                $Infer: {
                    ActiveOrganization: {},
                    Organization: {},
                    Invitation: {},
                    Member: {},
                    Team: {}
                },
                organization: {
                    checkRolePermission: (data)=>{
                        return clientSideHasPermission({
                            role: data.role,
                            options: {
                                ac: options?.ac,
                                roles
                            },
                            permissions: data.permissions ?? data.permission
                        });
                    }
                }
            }),
        getAtoms: ($fetch)=>{
            const listOrganizations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["i"])($listOrg, "/organization/list", $fetch, {
                method: "GET"
            });
            return {
                $listOrg,
                $activeOrgSignal,
                $activeMemberSignal,
                $activeMemberRoleSignal,
                activeOrganization: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["i"])([
                    $activeOrgSignal
                ], "/organization/get-full-organization", $fetch, ()=>({
                        method: "GET"
                    })),
                listOrganizations,
                activeMember: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["i"])([
                    $activeMemberSignal
                ], "/organization/get-active-member", $fetch, {
                    method: "GET"
                }),
                activeMemberRole: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["i"])([
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
                matcher (path) {
                    return path === "/organization/create" || path === "/organization/delete" || path === "/organization/update";
                },
                signal: "$listOrg"
            },
            {
                matcher (path) {
                    return path.startsWith("/organization");
                },
                signal: "$activeOrgSignal"
            },
            {
                matcher (path) {
                    return path.startsWith("/organization/set-active");
                },
                signal: "$sessionSignal"
            },
            {
                matcher (path) {
                    return path.includes("/organization/update-member-role");
                },
                signal: "$activeMemberSignal"
            },
            {
                matcher (path) {
                    return path.includes("/organization/update-member-role");
                },
                signal: "$activeMemberRoleSignal"
            }
        ]
    };
};
const inferOrgAdditionalFields = (schema)=>{
    return {};
};
//#endregion
//#region src/plugins/phone-number/client.ts
const phoneNumberClient = ()=>{
    return {
        id: "phoneNumber",
        $InferServerPlugin: {},
        atomListeners: [
            {
                matcher (path) {
                    return path === "/phone-number/update" || path === "/phone-number/verify" || path === "/sign-in/phone-number";
                },
                signal: "$sessionSignal"
            }
        ]
    };
};
//#endregion
//#region src/plugins/siwe/client.ts
const siweClient = ()=>{
    return {
        id: "siwe",
        $InferServerPlugin: {}
    };
};
//#endregion
//#region src/plugins/username/client.ts
const usernameClient = ()=>{
    return {
        id: "username",
        $InferServerPlugin: {},
        atomListeners: [
            {
                matcher: (path)=>path === "/sign-in/username",
                signal: "$sessionSignal"
            }
        ]
    };
};
//#endregion
//#region src/client/plugins/infer-plugin.ts
const InferServerPlugin = ()=>{
    return {
        id: "infer-server-plugin",
        $InferServerPlugin: {}
    };
};
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client/react/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAuthClient",
    ()=>createAuthClient,
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$url$2d$B7VXiggp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/url-B7VXiggp.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/proxy-DNjQepc2.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$parser$2d$g6CH$2d$tVp$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/parser-g6CH-tVp.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__capitalizeFirstLetter$3e$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-auth/core/dist/utils-BqQC77zO.mjs [app-ssr] (ecmascript) <export t as capitalizeFirstLetter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$listen$2d$keys$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nanostores/listen-keys/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
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
*/ function useStore(store, options = {}) {
    let snapshotRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(store.get());
    const { keys, deps = [
        store,
        keys
    ] } = options;
    let subscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((onChange)=>{
        const emitChange = (value)=>{
            if (snapshotRef.current === value) return;
            snapshotRef.current = value;
            onChange();
        };
        emitChange(store.value);
        if (keys?.length) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanostores$2f$listen$2d$keys$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listenKeys"])(store, keys, emitChange);
        return store.listen(emitChange);
    }, deps);
    let get = ()=>snapshotRef.current;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, get, get);
}
//#endregion
//#region src/client/react/index.ts
function getAtomKey(str) {
    return `use${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$node_modules$2f40$better$2d$auth$2f$core$2f$dist$2f$utils$2d$BqQC77zO$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__t__as__capitalizeFirstLetter$3e$__["capitalizeFirstLetter"])(str)}`;
}
function createAuthClient(options) {
    const { pluginPathMethods, pluginsActions, pluginsAtoms, $fetch, $store, atomListeners } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["n"])(options);
    let resolvedHooks = {};
    for (const [key, value] of Object.entries(pluginsAtoms))resolvedHooks[getAtomKey(key)] = ()=>useStore(value);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$proxy$2d$DNjQepc2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])({
        ...pluginsActions,
        ...resolvedHooks,
        $fetch,
        $store
    }, $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
;
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-BJRbyWu7.mjs [app-ssr] (ecmascript) <export r as createAuthClient>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAuthClient",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2d$BJRbyWu7$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["r"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2d$BJRbyWu7$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/better-auth/dist/client-BJRbyWu7.mjs [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/better-auth/node_modules/@better-fetch/fetch/dist/index.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BetterFetchError",
    ()=>BetterFetchError,
    "ValidationError",
    ()=>ValidationError,
    "applySchemaPlugin",
    ()=>applySchemaPlugin,
    "betterFetch",
    ()=>betterFetch,
    "bodyParser",
    ()=>bodyParser,
    "createFetch",
    ()=>createFetch,
    "createRetryStrategy",
    ()=>createRetryStrategy,
    "createSchema",
    ()=>createSchema,
    "detectContentType",
    ()=>detectContentType,
    "detectResponseType",
    ()=>detectResponseType,
    "getBody",
    ()=>getBody,
    "getFetch",
    ()=>getFetch,
    "getHeaders",
    ()=>getHeaders,
    "getMethod",
    ()=>getMethod,
    "getTimeout",
    ()=>getTimeout,
    "getURL",
    ()=>getURL,
    "initializePlugins",
    ()=>initializePlugins,
    "isFunction",
    ()=>isFunction,
    "isJSONParsable",
    ()=>isJSONParsable,
    "isJSONSerializable",
    ()=>isJSONSerializable,
    "isPayloadMethod",
    ()=>isPayloadMethod,
    "isRouteMethod",
    ()=>isRouteMethod,
    "jsonParse",
    ()=>jsonParse,
    "methods",
    ()=>methods,
    "parseStandardSchema",
    ()=>parseStandardSchema
]);
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value)=>key in obj ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value
    }) : obj[key] = value;
var __spreadValues = (a, b)=>{
    for(var prop in b || (b = {}))if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b)){
        if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    }
    return a;
};
var __spreadProps = (a, b)=>__defProps(a, __getOwnPropDescs(b));
// src/error.ts
var BetterFetchError = class extends Error {
    constructor(status, statusText, error){
        super(statusText || status.toString(), {
            cause: error
        });
        this.status = status;
        this.statusText = statusText;
        this.error = error;
    }
};
// src/plugins.ts
var initializePlugins = async (url, options)=>{
    var _a, _b, _c, _d, _e, _f;
    let opts = options || {};
    const hooks = {
        onRequest: [
            options == null ? void 0 : options.onRequest
        ],
        onResponse: [
            options == null ? void 0 : options.onResponse
        ],
        onSuccess: [
            options == null ? void 0 : options.onSuccess
        ],
        onError: [
            options == null ? void 0 : options.onError
        ],
        onRetry: [
            options == null ? void 0 : options.onRetry
        ]
    };
    if (!options || !(options == null ? void 0 : options.plugins)) {
        return {
            url,
            options: opts,
            hooks
        };
    }
    for (const plugin of (options == null ? void 0 : options.plugins) || []){
        if (plugin.init) {
            const pluginRes = await ((_a = plugin.init) == null ? void 0 : _a.call(plugin, url.toString(), options));
            opts = pluginRes.options || opts;
            url = pluginRes.url;
        }
        hooks.onRequest.push((_b = plugin.hooks) == null ? void 0 : _b.onRequest);
        hooks.onResponse.push((_c = plugin.hooks) == null ? void 0 : _c.onResponse);
        hooks.onSuccess.push((_d = plugin.hooks) == null ? void 0 : _d.onSuccess);
        hooks.onError.push((_e = plugin.hooks) == null ? void 0 : _e.onError);
        hooks.onRetry.push((_f = plugin.hooks) == null ? void 0 : _f.onRetry);
    }
    return {
        url,
        options: opts,
        hooks
    };
};
// src/retry.ts
var LinearRetryStrategy = class {
    constructor(options){
        this.options = options;
    }
    shouldAttemptRetry(attempt, response) {
        if (this.options.shouldRetry) {
            return Promise.resolve(attempt < this.options.attempts && this.options.shouldRetry(response));
        }
        return Promise.resolve(attempt < this.options.attempts);
    }
    getDelay() {
        return this.options.delay;
    }
};
var ExponentialRetryStrategy = class {
    constructor(options){
        this.options = options;
    }
    shouldAttemptRetry(attempt, response) {
        if (this.options.shouldRetry) {
            return Promise.resolve(attempt < this.options.attempts && this.options.shouldRetry(response));
        }
        return Promise.resolve(attempt < this.options.attempts);
    }
    getDelay(attempt) {
        const delay = Math.min(this.options.maxDelay, this.options.baseDelay * 2 ** attempt);
        return delay;
    }
};
function createRetryStrategy(options) {
    if (typeof options === "number") {
        return new LinearRetryStrategy({
            type: "linear",
            attempts: options,
            delay: 1e3
        });
    }
    switch(options.type){
        case "linear":
            return new LinearRetryStrategy(options);
        case "exponential":
            return new ExponentialRetryStrategy(options);
        default:
            throw new Error("Invalid retry strategy");
    }
}
// src/auth.ts
var getAuthHeader = async (options)=>{
    const headers = {};
    const getValue = async (value)=>typeof value === "function" ? await value() : value;
    if (options == null ? void 0 : options.auth) {
        if (options.auth.type === "Bearer") {
            const token = await getValue(options.auth.token);
            if (!token) {
                return headers;
            }
            headers["authorization"] = `Bearer ${token}`;
        } else if (options.auth.type === "Basic") {
            const username = getValue(options.auth.username);
            const password = getValue(options.auth.password);
            if (!username || !password) {
                return headers;
            }
            headers["authorization"] = `Basic ${btoa(`${username}:${password}`)}`;
        } else if (options.auth.type === "Custom") {
            const value = getValue(options.auth.value);
            if (!value) {
                return headers;
            }
            headers["authorization"] = `${getValue(options.auth.prefix)} ${value}`;
        }
    }
    return headers;
};
// src/utils.ts
var JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(request) {
    const _contentType = request.headers.get("content-type");
    const textTypes = /* @__PURE__ */ new Set([
        "image/svg",
        "application/xml",
        "application/xhtml",
        "application/html"
    ]);
    if (!_contentType) {
        return "json";
    }
    const contentType = _contentType.split(";").shift() || "";
    if (JSON_RE.test(contentType)) {
        return "json";
    }
    if (textTypes.has(contentType) || contentType.startsWith("text/")) {
        return "text";
    }
    return "blob";
}
function isJSONParsable(value) {
    try {
        JSON.parse(value);
        return true;
    } catch (error) {
        return false;
    }
}
function isJSONSerializable(value) {
    if (value === void 0) {
        return false;
    }
    const t = typeof value;
    if (t === "string" || t === "number" || t === "boolean" || t === null) {
        return true;
    }
    if (t !== "object") {
        return false;
    }
    if (Array.isArray(value)) {
        return true;
    }
    if (value.buffer) {
        return false;
    }
    return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
function jsonParse(text) {
    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
}
function isFunction(value) {
    return typeof value === "function";
}
function getFetch(options) {
    if (options == null ? void 0 : options.customFetchImpl) {
        return options.customFetchImpl;
    }
    if (typeof globalThis !== "undefined" && isFunction(globalThis.fetch)) {
        return globalThis.fetch;
    }
    if (("TURBOPACK compile-time value", "undefined") !== "undefined" && isFunction(window.fetch)) //TURBOPACK unreachable
    ;
    throw new Error("No fetch implementation found");
}
function isPayloadMethod(method) {
    if (!method) {
        return false;
    }
    const payloadMethod = [
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ];
    return payloadMethod.includes(method.toUpperCase());
}
function isRouteMethod(method) {
    const routeMethod = [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ];
    if (!method) {
        return false;
    }
    return routeMethod.includes(method.toUpperCase());
}
async function getHeaders(opts) {
    const headers = new Headers(opts == null ? void 0 : opts.headers);
    const authHeader = await getAuthHeader(opts);
    for (const [key, value] of Object.entries(authHeader || {})){
        headers.set(key, value);
    }
    if (!headers.has("content-type")) {
        const t = detectContentType(opts == null ? void 0 : opts.body);
        if (t) {
            headers.set("content-type", t);
        }
    }
    return headers;
}
function getURL(url, options) {
    if (url.startsWith("@")) {
        const m = url.toString().split("@")[1].split("/")[0];
        if (methods.includes(m)) {
            url = url.replace(`@${m}/`, "/");
        }
    }
    let _url;
    try {
        if (url.startsWith("http")) {
            _url = url;
        } else {
            let baseURL = options == null ? void 0 : options.baseURL;
            if (baseURL && !(baseURL == null ? void 0 : baseURL.endsWith("/"))) {
                baseURL = baseURL + "/";
            }
            if (url.startsWith("/")) {
                _url = new URL(url.substring(1), baseURL);
            } else {
                _url = new URL(url, options == null ? void 0 : options.baseURL);
            }
        }
    } catch (e) {
        if (e instanceof TypeError) {
            if (!(options == null ? void 0 : options.baseURL)) {
                throw TypeError(`Invalid URL ${url}. Are you passing in a relative url but not setting the baseURL?`);
            }
            throw TypeError(`Invalid URL ${url}. Please validate that you are passing the correct input.`);
        }
        throw e;
    }
    if (options == null ? void 0 : options.params) {
        if (Array.isArray(options == null ? void 0 : options.params)) {
            const params = (options == null ? void 0 : options.params) ? Array.isArray(options.params) ? `/${options.params.join("/")}` : `/${Object.values(options.params).join("/")}` : "";
            _url = _url.toString().split("/:")[0];
            _url = `${_url.toString()}${params}`;
        } else {
            for (const [key, value] of Object.entries(options == null ? void 0 : options.params)){
                _url = _url.toString().replace(`:${key}`, String(value));
            }
        }
    }
    const __url = new URL(_url);
    const queryParams = options == null ? void 0 : options.query;
    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)){
            __url.searchParams.append(key, String(value));
        }
    }
    return __url;
}
function detectContentType(body) {
    if (isJSONSerializable(body)) {
        return "application/json";
    }
    return null;
}
function getBody(options) {
    if (!(options == null ? void 0 : options.body)) {
        return null;
    }
    const headers = new Headers(options == null ? void 0 : options.headers);
    if (isJSONSerializable(options.body) && !headers.has("content-type")) {
        for (const [key, value] of Object.entries(options == null ? void 0 : options.body)){
            if (value instanceof Date) {
                options.body[key] = value.toISOString();
            }
        }
        return JSON.stringify(options.body);
    }
    return options.body;
}
function getMethod(url, options) {
    var _a;
    if (options == null ? void 0 : options.method) {
        return options.method.toUpperCase();
    }
    if (url.startsWith("@")) {
        const pMethod = (_a = url.split("@")[1]) == null ? void 0 : _a.split("/")[0];
        if (!methods.includes(pMethod)) {
            return (options == null ? void 0 : options.body) ? "POST" : "GET";
        }
        return pMethod.toUpperCase();
    }
    return (options == null ? void 0 : options.body) ? "POST" : "GET";
}
function getTimeout(options, controller) {
    let abortTimeout;
    if (!(options == null ? void 0 : options.signal) && (options == null ? void 0 : options.timeout)) {
        abortTimeout = setTimeout(()=>controller == null ? void 0 : controller.abort(), options == null ? void 0 : options.timeout);
    }
    return {
        abortTimeout,
        clearTimeout: ()=>{
            if (abortTimeout) {
                clearTimeout(abortTimeout);
            }
        }
    };
}
function bodyParser(data, responseType) {
    if (responseType === "json") {
        return JSON.parse(data);
    }
    return data;
}
var ValidationError = class _ValidationError extends Error {
    constructor(issues, message){
        super(message || JSON.stringify(issues, null, 2));
        this.issues = issues;
        Object.setPrototypeOf(this, _ValidationError.prototype);
    }
};
async function parseStandardSchema(schema, input) {
    let result = await schema["~standard"].validate(input);
    if (result.issues) {
        throw new ValidationError(result.issues);
    }
    return result.value;
}
// src/create-fetch/schema.ts
var methods = [
    "get",
    "post",
    "put",
    "patch",
    "delete"
];
var createSchema = (schema, config)=>{
    return {
        schema,
        config
    };
};
// src/create-fetch/index.ts
var applySchemaPlugin = (config)=>({
        id: "apply-schema",
        name: "Apply Schema",
        version: "1.0.0",
        async init (url, options) {
            var _a, _b, _c, _d;
            const schema = ((_b = (_a = config.plugins) == null ? void 0 : _a.find((plugin)=>{
                var _a2;
                return ((_a2 = plugin.schema) == null ? void 0 : _a2.config) ? url.startsWith(plugin.schema.config.baseURL || "") || url.startsWith(plugin.schema.config.prefix || "") : false;
            })) == null ? void 0 : _b.schema) || config.schema;
            if (schema) {
                let urlKey = url;
                if ((_c = schema.config) == null ? void 0 : _c.prefix) {
                    if (urlKey.startsWith(schema.config.prefix)) {
                        urlKey = urlKey.replace(schema.config.prefix, "");
                        if (schema.config.baseURL) {
                            url = url.replace(schema.config.prefix, schema.config.baseURL);
                        }
                    }
                }
                if ((_d = schema.config) == null ? void 0 : _d.baseURL) {
                    if (urlKey.startsWith(schema.config.baseURL)) {
                        urlKey = urlKey.replace(schema.config.baseURL, "");
                    }
                }
                const keySchema = schema.schema[urlKey];
                if (keySchema) {
                    let opts = __spreadProps(__spreadValues({}, options), {
                        method: keySchema.method,
                        output: keySchema.output
                    });
                    if (!(options == null ? void 0 : options.disableValidation)) {
                        opts = __spreadProps(__spreadValues({}, opts), {
                            body: keySchema.input ? await parseStandardSchema(keySchema.input, options == null ? void 0 : options.body) : options == null ? void 0 : options.body,
                            params: keySchema.params ? await parseStandardSchema(keySchema.params, options == null ? void 0 : options.params) : options == null ? void 0 : options.params,
                            query: keySchema.query ? await parseStandardSchema(keySchema.query, options == null ? void 0 : options.query) : options == null ? void 0 : options.query
                        });
                    }
                    return {
                        url,
                        options: opts
                    };
                }
            }
            return {
                url,
                options
            };
        }
    });
var createFetch = (config)=>{
    async function $fetch(url, options) {
        const opts = __spreadProps(__spreadValues(__spreadValues({}, config), options), {
            plugins: [
                ...(config == null ? void 0 : config.plugins) || [],
                applySchemaPlugin(config || {})
            ]
        });
        if (config == null ? void 0 : config.catchAllError) {
            try {
                return await betterFetch(url, opts);
            } catch (error) {
                return {
                    data: null,
                    error: {
                        status: 500,
                        statusText: "Fetch Error",
                        message: "Fetch related error. Captured by catchAllError option. See error property for more details.",
                        error
                    }
                };
            }
        }
        return await betterFetch(url, opts);
    }
    return $fetch;
};
// src/url.ts
function getURL2(url, option) {
    let { baseURL, params, query } = option || {
        query: {},
        params: {},
        baseURL: ""
    };
    let basePath = url.startsWith("http") ? url.split("/").slice(0, 3).join("/") : baseURL || "";
    if (url.startsWith("@")) {
        const m = url.toString().split("@")[1].split("/")[0];
        if (methods.includes(m)) {
            url = url.replace(`@${m}/`, "/");
        }
    }
    if (!basePath.endsWith("/")) basePath += "/";
    let [path, urlQuery] = url.replace(basePath, "").split("?");
    const queryParams = new URLSearchParams(urlQuery);
    for (const [key, value] of Object.entries(query || {})){
        if (value == null) continue;
        queryParams.set(key, String(value));
    }
    if (params) {
        if (Array.isArray(params)) {
            const paramPaths = path.split("/").filter((p)=>p.startsWith(":"));
            for (const [index, key] of paramPaths.entries()){
                const value = params[index];
                path = path.replace(key, value);
            }
        } else {
            for (const [key, value] of Object.entries(params)){
                path = path.replace(`:${key}`, String(value));
            }
        }
    }
    path = path.split("/").map(encodeURIComponent).join("/");
    if (path.startsWith("/")) path = path.slice(1);
    let queryParamString = queryParams.toString();
    queryParamString = queryParamString.length > 0 ? `?${queryParamString}`.replace(/\+/g, "%20") : "";
    if (!basePath.startsWith("http")) {
        return `${basePath}${path}${queryParamString}`;
    }
    const _url = new URL(`${path}${queryParamString}`, basePath);
    return _url;
}
// src/fetch.ts
var betterFetch = async (url, options)=>{
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { hooks, url: __url, options: opts } = await initializePlugins(url, options);
    const fetch = getFetch(opts);
    const controller = new AbortController();
    const signal = (_a = opts.signal) != null ? _a : controller.signal;
    const _url = getURL2(__url, opts);
    const body = getBody(opts);
    const headers = await getHeaders(opts);
    const method = getMethod(__url, opts);
    let context = __spreadProps(__spreadValues({}, opts), {
        url: _url,
        headers,
        body,
        method,
        signal
    });
    for (const onRequest of hooks.onRequest){
        if (onRequest) {
            const res = await onRequest(context);
            if (res instanceof Object) {
                context = res;
            }
        }
    }
    if ("pipeTo" in context && typeof context.pipeTo === "function" || typeof ((_b = options == null ? void 0 : options.body) == null ? void 0 : _b.pipe) === "function") {
        if (!("duplex" in context)) {
            context.duplex = "half";
        }
    }
    const { clearTimeout: clearTimeout2 } = getTimeout(opts, controller);
    let response = await fetch(context.url, context);
    clearTimeout2();
    const responseContext = {
        response,
        request: context
    };
    for (const onResponse of hooks.onResponse){
        if (onResponse) {
            const r = await onResponse(__spreadProps(__spreadValues({}, responseContext), {
                response: ((_c = options == null ? void 0 : options.hookOptions) == null ? void 0 : _c.cloneResponse) ? response.clone() : response
            }));
            if (r instanceof Response) {
                response = r;
            } else if (r instanceof Object) {
                response = r.response;
            }
        }
    }
    if (response.ok) {
        const hasBody = context.method !== "HEAD";
        if (!hasBody) {
            return {
                data: "",
                error: null
            };
        }
        const responseType = detectResponseType(response);
        const successContext = {
            data: "",
            response,
            request: context
        };
        if (responseType === "json" || responseType === "text") {
            const text = await response.text();
            const parser2 = (_d = context.jsonParser) != null ? _d : jsonParse;
            const data = await parser2(text);
            successContext.data = data;
        } else {
            successContext.data = await response[responseType]();
        }
        if (context == null ? void 0 : context.output) {
            if (context.output && !context.disableValidation) {
                successContext.data = await parseStandardSchema(context.output, successContext.data);
            }
        }
        for (const onSuccess of hooks.onSuccess){
            if (onSuccess) {
                await onSuccess(__spreadProps(__spreadValues({}, successContext), {
                    response: ((_e = options == null ? void 0 : options.hookOptions) == null ? void 0 : _e.cloneResponse) ? response.clone() : response
                }));
            }
        }
        if (options == null ? void 0 : options.throw) {
            return successContext.data;
        }
        return {
            data: successContext.data,
            error: null
        };
    }
    const parser = (_f = options == null ? void 0 : options.jsonParser) != null ? _f : jsonParse;
    const responseText = await response.text();
    const isJSONResponse = isJSONParsable(responseText);
    const errorObject = isJSONResponse ? await parser(responseText) : null;
    const errorContext = {
        response,
        responseText,
        request: context,
        error: __spreadProps(__spreadValues({}, errorObject), {
            status: response.status,
            statusText: response.statusText
        })
    };
    for (const onError of hooks.onError){
        if (onError) {
            await onError(__spreadProps(__spreadValues({}, errorContext), {
                response: ((_g = options == null ? void 0 : options.hookOptions) == null ? void 0 : _g.cloneResponse) ? response.clone() : response
            }));
        }
    }
    if (options == null ? void 0 : options.retry) {
        const retryStrategy = createRetryStrategy(options.retry);
        const _retryAttempt = (_h = options.retryAttempt) != null ? _h : 0;
        if (await retryStrategy.shouldAttemptRetry(_retryAttempt, response)) {
            for (const onRetry of hooks.onRetry){
                if (onRetry) {
                    await onRetry(responseContext);
                }
            }
            const delay = retryStrategy.getDelay(_retryAttempt);
            await new Promise((resolve)=>setTimeout(resolve, delay));
            return await betterFetch(url, __spreadProps(__spreadValues({}, options), {
                retryAttempt: _retryAttempt + 1
            }));
        }
    }
    if (options == null ? void 0 : options.throw) {
        throw new BetterFetchError(response.status, response.statusText, isJSONResponse ? errorObject : responseText);
    }
    return {
        data: null,
        error: __spreadProps(__spreadValues({}, errorObject), {
            status: response.status,
            statusText: response.statusText
        })
    };
};
;
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/shared/src/utils.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hasA11yProp",
    ()=>hasA11yProp,
    "mergeClasses",
    ()=>mergeClasses,
    "toCamelCase",
    ()=>toCamelCase,
    "toKebabCase",
    ()=>toKebabCase,
    "toPascalCase",
    ()=>toPascalCase
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const toKebabCase = (string)=>string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string)=>string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2)=>p2 ? p2.toUpperCase() : p1.toLowerCase());
const toPascalCase = (string)=>{
    const camelCase = toCamelCase(string);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes)=>classes.filter((className, index, array)=>{
        return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
    }).join(" ").trim();
const hasA11yProp = (props)=>{
    for(const prop in props){
        if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
            return true;
        }
    }
};
;
 //# sourceMappingURL=utils.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/defaultAttributes.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>defaultAttributes
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
};
;
 //# sourceMappingURL=defaultAttributes.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/Icon.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Icon
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$defaultAttributes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/defaultAttributes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/shared/src/utils.js [app-ssr] (ecmascript)");
;
;
;
const Icon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"])("svg", {
        ref,
        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$defaultAttributes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mergeClasses"])("lucide", className),
        ...!children && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasA11yProp"])(rest) && {
            "aria-hidden": "true"
        },
        ...rest
    }, [
        ...iconNode.map(([tag, attrs])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"])(tag, attrs)),
        ...Array.isArray(children) ? children : [
            children
        ]
    ]));
;
 //# sourceMappingURL=Icon.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>createLucideIcon
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/shared/src/utils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$Icon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/Icon.js [app-ssr] (ecmascript)");
;
;
;
const createLucideIcon = (iconName, iconNode)=>{
    const Component = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$Icon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            ref,
            iconNode,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mergeClasses"])(`lucide-${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toKebabCase"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toPascalCase"])(iconName))}`, `lucide-${iconName}`, className),
            ...props
        }));
    Component.displayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toPascalCase"])(iconName);
    return Component;
};
;
 //# sourceMappingURL=createLucideIcon.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/archive.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Archive
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "20",
            height: "5",
            x: "2",
            y: "3",
            rx: "1",
            key: "1wp1u1"
        }
    ],
    [
        "path",
        {
            d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8",
            key: "1s80jp"
        }
    ],
    [
        "path",
        {
            d: "M10 12h4",
            key: "a56b0p"
        }
    ]
];
const Archive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("archive", __iconNode);
;
 //# sourceMappingURL=archive.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/archive.js [app-ssr] (ecmascript) <export default as Archive>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Archive",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/archive.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ArrowLeft
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m12 19-7-7 7-7",
            key: "1l729n"
        }
    ],
    [
        "path",
        {
            d: "M19 12H5",
            key: "x3x0zl"
        }
    ]
];
const ArrowLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("arrow-left", __iconNode);
;
 //# sourceMappingURL=arrow-left.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeftIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowLeftIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/building.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Building
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 10h.01",
            key: "1nrarc"
        }
    ],
    [
        "path",
        {
            d: "M12 14h.01",
            key: "1etili"
        }
    ],
    [
        "path",
        {
            d: "M12 6h.01",
            key: "1vi96p"
        }
    ],
    [
        "path",
        {
            d: "M16 10h.01",
            key: "1m94wz"
        }
    ],
    [
        "path",
        {
            d: "M16 14h.01",
            key: "1gbofw"
        }
    ],
    [
        "path",
        {
            d: "M16 6h.01",
            key: "1x0f13"
        }
    ],
    [
        "path",
        {
            d: "M8 10h.01",
            key: "19clt8"
        }
    ],
    [
        "path",
        {
            d: "M8 14h.01",
            key: "6423bh"
        }
    ],
    [
        "path",
        {
            d: "M8 6h.01",
            key: "1dz90k"
        }
    ],
    [
        "path",
        {
            d: "M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",
            key: "cabbwy"
        }
    ],
    [
        "rect",
        {
            x: "4",
            y: "2",
            width: "16",
            height: "20",
            rx: "2",
            key: "1uxh74"
        }
    ]
];
const Building = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("building", __iconNode);
;
 //# sourceMappingURL=building.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/building.js [app-ssr] (ecmascript) <export default as BuildingIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BuildingIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/building.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Check
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M20 6 9 17l-5-5",
            key: "1gmf2c"
        }
    ]
];
const Check = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("check", __iconNode);
;
 //# sourceMappingURL=check.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as CheckIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CheckIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChevronDown
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m6 9 6 6 6-6",
            key: "qrunsl"
        }
    ]
];
const ChevronDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("chevron-down", __iconNode);
;
 //# sourceMappingURL=chevron-down.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDownIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChevronDownIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChevronUp
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m18 15-6-6-6 6",
            key: "153udz"
        }
    ]
];
const ChevronUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("chevron-up", __iconNode);
;
 //# sourceMappingURL=chevron-up.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-ssr] (ecmascript) <export default as ChevronUpIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChevronUpIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/chevrons-up-down.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChevronsUpDown
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m7 15 5 5 5-5",
            key: "1hf1tw"
        }
    ],
    [
        "path",
        {
            d: "m7 9 5-5 5 5",
            key: "sgt6xg"
        }
    ]
];
const ChevronsUpDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("chevrons-up-down", __iconNode);
;
 //# sourceMappingURL=chevrons-up-down.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/chevrons-up-down.js [app-ssr] (ecmascript) <export default as ChevronsUpDown>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChevronsUpDown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/chevrons-up-down.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/copy.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Copy
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "14",
            height: "14",
            x: "8",
            y: "8",
            rx: "2",
            ry: "2",
            key: "17jyea"
        }
    ],
    [
        "path",
        {
            d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
            key: "zix9uf"
        }
    ]
];
const Copy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("copy", __iconNode);
;
 //# sourceMappingURL=copy.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/copy.js [app-ssr] (ecmascript) <export default as CopyIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CopyIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/copy.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/square-pen.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>SquarePen
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
            key: "1m0v6g"
        }
    ],
    [
        "path",
        {
            d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
            key: "ohrbg2"
        }
    ]
];
const SquarePen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("square-pen", __iconNode);
;
 //# sourceMappingURL=square-pen.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/square-pen.js [app-ssr] (ecmascript) <export default as Edit>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Edit",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/square-pen.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/ellipsis.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Ellipsis
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "1",
            key: "41hilf"
        }
    ],
    [
        "circle",
        {
            cx: "19",
            cy: "12",
            r: "1",
            key: "1wjl8i"
        }
    ],
    [
        "circle",
        {
            cx: "5",
            cy: "12",
            r: "1",
            key: "1pcz8c"
        }
    ]
];
const Ellipsis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("ellipsis", __iconNode);
;
 //# sourceMappingURL=ellipsis.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/ellipsis.js [app-ssr] (ecmascript) <export default as EllipsisIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EllipsisIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/ellipsis.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Eye
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
            key: "1nclc0"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "3",
            key: "1v7zrd"
        }
    ]
];
const Eye = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("eye", __iconNode);
;
 //# sourceMappingURL=eye.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as EyeIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EyeIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>EyeOff
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
            key: "ct8e1f"
        }
    ],
    [
        "path",
        {
            d: "M14.084 14.158a3 3 0 0 1-4.242-4.242",
            key: "151rxh"
        }
    ],
    [
        "path",
        {
            d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
            key: "13bj9a"
        }
    ],
    [
        "path",
        {
            d: "m2 2 20 20",
            key: "1ooewy"
        }
    ]
];
const EyeOff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("eye-off", __iconNode);
;
 //# sourceMappingURL=eye-off.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript) <export default as EyeOffIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EyeOffIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/fingerprint-pattern.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>FingerprintPattern
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",
            key: "1nerag"
        }
    ],
    [
        "path",
        {
            d: "M14 13.12c0 2.38 0 6.38-1 8.88",
            key: "o46ks0"
        }
    ],
    [
        "path",
        {
            d: "M17.29 21.02c.12-.6.43-2.3.5-3.02",
            key: "ptglia"
        }
    ],
    [
        "path",
        {
            d: "M2 12a10 10 0 0 1 18-6",
            key: "ydlgp0"
        }
    ],
    [
        "path",
        {
            d: "M2 16h.01",
            key: "1gqxmh"
        }
    ],
    [
        "path",
        {
            d: "M21.8 16c.2-2 .131-5.354 0-6",
            key: "drycrb"
        }
    ],
    [
        "path",
        {
            d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",
            key: "1tidbn"
        }
    ],
    [
        "path",
        {
            d: "M8.65 22c.21-.66.45-1.32.57-2",
            key: "13wd9y"
        }
    ],
    [
        "path",
        {
            d: "M9 6.8a6 6 0 0 1 9 5.2v2",
            key: "1fr1j5"
        }
    ]
];
const FingerprintPattern = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("fingerprint-pattern", __iconNode);
;
 //# sourceMappingURL=fingerprint-pattern.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/fingerprint-pattern.js [app-ssr] (ecmascript) <export default as FingerprintIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FingerprintIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$fingerprint$2d$pattern$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$fingerprint$2d$pattern$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/fingerprint-pattern.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/key-round.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>KeyRound
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
            key: "1s6t7t"
        }
    ],
    [
        "circle",
        {
            cx: "16.5",
            cy: "7.5",
            r: ".5",
            fill: "currentColor",
            key: "w0ekpg"
        }
    ]
];
const KeyRound = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("key-round", __iconNode);
;
 //# sourceMappingURL=key-round.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/key-round.js [app-ssr] (ecmascript) <export default as KeyRoundIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KeyRoundIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/key-round.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/laptop.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Laptop
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z",
            key: "1pdavp"
        }
    ],
    [
        "path",
        {
            d: "M20.054 15.987H3.946",
            key: "14rxg9"
        }
    ]
];
const Laptop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("laptop", __iconNode);
;
 //# sourceMappingURL=laptop.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/laptop.js [app-ssr] (ecmascript) <export default as LaptopIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LaptopIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$laptop$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$laptop$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/laptop.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>LoaderCircle
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M21 12a9 9 0 1 1-6.219-8.56",
            key: "13zald"
        }
    ]
];
const LoaderCircle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("loader-circle", __iconNode);
;
 //# sourceMappingURL=loader-circle.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Loader2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Lock
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "18",
            height: "11",
            x: "3",
            y: "11",
            rx: "2",
            ry: "2",
            key: "1w4ew1"
        }
    ],
    [
        "path",
        {
            d: "M7 11V7a5 5 0 0 1 10 0v4",
            key: "fwvmzm"
        }
    ]
];
const Lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("lock", __iconNode);
;
 //# sourceMappingURL=lock.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript) <export default as LockIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LockIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/log-in.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>LogIn
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m10 17 5-5-5-5",
            key: "1bsop3"
        }
    ],
    [
        "path",
        {
            d: "M15 12H3",
            key: "6jk70r"
        }
    ],
    [
        "path",
        {
            d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",
            key: "u53s6r"
        }
    ]
];
const LogIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("log-in", __iconNode);
;
 //# sourceMappingURL=log-in.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/log-in.js [app-ssr] (ecmascript) <export default as LogInIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LogInIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/log-in.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>LogOut
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m16 17 5-5-5-5",
            key: "1bji2h"
        }
    ],
    [
        "path",
        {
            d: "M21 12H9",
            key: "dn1m92"
        }
    ],
    [
        "path",
        {
            d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
            key: "1uf3rs"
        }
    ]
];
const LogOut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("log-out", __iconNode);
;
 //# sourceMappingURL=log-out.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOutIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LogOutIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/mail.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Mail
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",
            key: "132q7q"
        }
    ],
    [
        "rect",
        {
            x: "2",
            y: "4",
            width: "20",
            height: "16",
            rx: "2",
            key: "izxlao"
        }
    ]
];
const Mail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("mail", __iconNode);
;
 //# sourceMappingURL=mail.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/mail.js [app-ssr] (ecmascript) <export default as MailIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MailIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/mail.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Menu
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M4 5h16",
            key: "1tepv9"
        }
    ],
    [
        "path",
        {
            d: "M4 12h16",
            key: "1lakjw"
        }
    ],
    [
        "path",
        {
            d: "M4 19h16",
            key: "1djgab"
        }
    ]
];
const Menu = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("menu", __iconNode);
;
 //# sourceMappingURL=menu.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript) <export default as MenuIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MenuIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/minus.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Minus
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M5 12h14",
            key: "1ays0h"
        }
    ]
];
const Minus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("minus", __iconNode);
;
 //# sourceMappingURL=minus.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/minus.js [app-ssr] (ecmascript) <export default as MinusIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MinusIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/minus.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>CirclePlus
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }
    ],
    [
        "path",
        {
            d: "M8 12h8",
            key: "1wcyev"
        }
    ],
    [
        "path",
        {
            d: "M12 8v8",
            key: "napkw2"
        }
    ]
];
const CirclePlus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("circle-plus", __iconNode);
;
 //# sourceMappingURL=circle-plus.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-ssr] (ecmascript) <export default as PlusCircleIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlusCircleIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/qr-code.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>QrCode
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "5",
            height: "5",
            x: "3",
            y: "3",
            rx: "1",
            key: "1tu5fj"
        }
    ],
    [
        "rect",
        {
            width: "5",
            height: "5",
            x: "16",
            y: "3",
            rx: "1",
            key: "1v8r4q"
        }
    ],
    [
        "rect",
        {
            width: "5",
            height: "5",
            x: "3",
            y: "16",
            rx: "1",
            key: "1x03jg"
        }
    ],
    [
        "path",
        {
            d: "M21 16h-3a2 2 0 0 0-2 2v3",
            key: "177gqh"
        }
    ],
    [
        "path",
        {
            d: "M21 21v.01",
            key: "ents32"
        }
    ],
    [
        "path",
        {
            d: "M12 7v3a2 2 0 0 1-2 2H7",
            key: "8crl2c"
        }
    ],
    [
        "path",
        {
            d: "M3 12h.01",
            key: "nlz23k"
        }
    ],
    [
        "path",
        {
            d: "M12 3h.01",
            key: "n36tog"
        }
    ],
    [
        "path",
        {
            d: "M12 16v.01",
            key: "133mhm"
        }
    ],
    [
        "path",
        {
            d: "M16 12h1",
            key: "1slzba"
        }
    ],
    [
        "path",
        {
            d: "M21 12v.01",
            key: "1lwtk9"
        }
    ],
    [
        "path",
        {
            d: "M12 21v-1",
            key: "1880an"
        }
    ]
];
const QrCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("qr-code", __iconNode);
;
 //# sourceMappingURL=qr-code.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/qr-code.js [app-ssr] (ecmascript) <export default as QrCodeIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QrCodeIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$qr$2d$code$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$qr$2d$code$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/qr-code.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/repeat.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Repeat
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m17 2 4 4-4 4",
            key: "nntrym"
        }
    ],
    [
        "path",
        {
            d: "M3 11v-1a4 4 0 0 1 4-4h14",
            key: "84bu3i"
        }
    ],
    [
        "path",
        {
            d: "m7 22-4-4 4-4",
            key: "1wqhfi"
        }
    ],
    [
        "path",
        {
            d: "M21 13v1a4 4 0 0 1-4 4H3",
            key: "1rx37r"
        }
    ]
];
const Repeat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("repeat", __iconNode);
;
 //# sourceMappingURL=repeat.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/repeat.js [app-ssr] (ecmascript) <export default as RepeatIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RepeatIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$repeat$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$repeat$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/repeat.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/send.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Send
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
            key: "1ffxy3"
        }
    ],
    [
        "path",
        {
            d: "m21.854 2.147-10.94 10.939",
            key: "12cjpa"
        }
    ]
];
const Send = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("send", __iconNode);
;
 //# sourceMappingURL=send.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/send.js [app-ssr] (ecmascript) <export default as SendIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SendIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/send.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Settings
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
            key: "1i5ecw"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "3",
            key: "1v7zrd"
        }
    ]
];
const Settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("settings", __iconNode);
;
 //# sourceMappingURL=settings.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as SettingsIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SettingsIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/smartphone.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Smartphone
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "14",
            height: "20",
            x: "5",
            y: "2",
            rx: "2",
            ry: "2",
            key: "1yt0o3"
        }
    ],
    [
        "path",
        {
            d: "M12 18h.01",
            key: "mhygvu"
        }
    ]
];
const Smartphone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("smartphone", __iconNode);
;
 //# sourceMappingURL=smartphone.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/smartphone.js [app-ssr] (ecmascript) <export default as SmartphoneIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SmartphoneIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/smartphone.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Trash2
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M10 11v6",
            key: "nco0om"
        }
    ],
    [
        "path",
        {
            d: "M14 11v6",
            key: "outv1u"
        }
    ],
    [
        "path",
        {
            d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
            key: "miytrc"
        }
    ],
    [
        "path",
        {
            d: "M3 6h18",
            key: "d0wm0j"
        }
    ],
    [
        "path",
        {
            d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
            key: "e791ji"
        }
    ]
];
const Trash2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("trash-2", __iconNode);
;
 //# sourceMappingURL=trash-2.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2Icon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Trash2Icon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/cloud-upload.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>CloudUpload
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 13v8",
            key: "1l5pq0"
        }
    ],
    [
        "path",
        {
            d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",
            key: "1pljnt"
        }
    ],
    [
        "path",
        {
            d: "m8 17 4-4 4 4",
            key: "1quai1"
        }
    ]
];
const CloudUpload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("cloud-upload", __iconNode);
;
 //# sourceMappingURL=cloud-upload.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/cloud-upload.js [app-ssr] (ecmascript) <export default as UploadCloudIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UploadCloudIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/cloud-upload.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-cog.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>UserCog
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M10 15H6a4 4 0 0 0-4 4v2",
            key: "1nfge6"
        }
    ],
    [
        "path",
        {
            d: "m14.305 16.53.923-.382",
            key: "1itpsq"
        }
    ],
    [
        "path",
        {
            d: "m15.228 13.852-.923-.383",
            key: "eplpkm"
        }
    ],
    [
        "path",
        {
            d: "m16.852 12.228-.383-.923",
            key: "13v3q0"
        }
    ],
    [
        "path",
        {
            d: "m16.852 17.772-.383.924",
            key: "1i8mnm"
        }
    ],
    [
        "path",
        {
            d: "m19.148 12.228.383-.923",
            key: "1q8j1v"
        }
    ],
    [
        "path",
        {
            d: "m19.53 18.696-.382-.924",
            key: "vk1qj3"
        }
    ],
    [
        "path",
        {
            d: "m20.772 13.852.924-.383",
            key: "n880s0"
        }
    ],
    [
        "path",
        {
            d: "m20.772 16.148.924.383",
            key: "1g6xey"
        }
    ],
    [
        "circle",
        {
            cx: "18",
            cy: "15",
            r: "3",
            key: "gjjjvw"
        }
    ],
    [
        "circle",
        {
            cx: "9",
            cy: "7",
            r: "4",
            key: "nufk8"
        }
    ]
];
const UserCog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("user-cog", __iconNode);
;
 //# sourceMappingURL=user-cog.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-cog.js [app-ssr] (ecmascript) <export default as UserCogIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserCogIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$cog$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$cog$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-cog.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-round.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>UserRound
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "8",
            r: "5",
            key: "1hypcn"
        }
    ],
    [
        "path",
        {
            d: "M20 21a8 8 0 0 0-16 0",
            key: "rfgkzh"
        }
    ]
];
const UserRound = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("user-round", __iconNode);
;
 //# sourceMappingURL=user-round.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-round.js [app-ssr] (ecmascript) <export default as UserRoundIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserRoundIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-round.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-round-plus.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>UserRoundPlus
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M2 21a8 8 0 0 1 13.292-6",
            key: "bjp14o"
        }
    ],
    [
        "circle",
        {
            cx: "10",
            cy: "8",
            r: "5",
            key: "o932ke"
        }
    ],
    [
        "path",
        {
            d: "M19 16v6",
            key: "tddt3s"
        }
    ],
    [
        "path",
        {
            d: "M22 19h-6",
            key: "vcuq98"
        }
    ]
];
const UserRoundPlus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("user-round-plus", __iconNode);
;
 //# sourceMappingURL=user-round-plus.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-round-plus.js [app-ssr] (ecmascript) <export default as UserRoundPlus>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserRoundPlus",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2d$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2d$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-round-plus.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-round-x.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>UserRoundX
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M2 21a8 8 0 0 1 11.873-7",
            key: "74fkxq"
        }
    ],
    [
        "circle",
        {
            cx: "10",
            cy: "8",
            r: "5",
            key: "o932ke"
        }
    ],
    [
        "path",
        {
            d: "m17 17 5 5",
            key: "p7ous7"
        }
    ],
    [
        "path",
        {
            d: "m22 17-5 5",
            key: "gqnmv0"
        }
    ]
];
const UserRoundX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("user-round-x", __iconNode);
;
 //# sourceMappingURL=user-round-x.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-round-x.js [app-ssr] (ecmascript) <export default as UserX2Icon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserX2Icon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-round-x.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-x.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>UserX
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
            key: "1yyitq"
        }
    ],
    [
        "circle",
        {
            cx: "9",
            cy: "7",
            r: "4",
            key: "nufk8"
        }
    ],
    [
        "line",
        {
            x1: "17",
            x2: "22",
            y1: "8",
            y2: "13",
            key: "3nzzx3"
        }
    ],
    [
        "line",
        {
            x1: "22",
            x2: "17",
            y1: "8",
            y2: "13",
            key: "1swrse"
        }
    ]
];
const UserX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("user-x", __iconNode);
;
 //# sourceMappingURL=user-x.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-x.js [app-ssr] (ecmascript) <export default as UserXIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserXIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/user-x.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Users
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
            key: "1yyitq"
        }
    ],
    [
        "path",
        {
            d: "M16 3.128a4 4 0 0 1 0 7.744",
            key: "16gr8j"
        }
    ],
    [
        "path",
        {
            d: "M22 21v-2a4 4 0 0 0-3-3.87",
            key: "kshegd"
        }
    ],
    [
        "circle",
        {
            cx: "9",
            cy: "7",
            r: "4",
            key: "nufk8"
        }
    ]
];
const Users = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("users", __iconNode);
;
 //# sourceMappingURL=users.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as UsersIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UsersIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>X
]);
/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M18 6 6 18",
            key: "1bl5f8"
        }
    ],
    [
        "path",
        {
            d: "m6 6 12 12",
            key: "d8bk6v"
        }
    ]
];
const X = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("x", __iconNode);
;
 //# sourceMappingURL=x.js.map
}),
"[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as XIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "XIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$auth$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/auth/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript)");
}),
];

//# sourceMappingURL=6866a_839c5607._.js.map