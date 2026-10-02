import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  expect:{timeout:20000},testDir:'./tests/browser',fullyParallel:false,workers:1,
  use:{baseURL:'http://localhost:3100',trace:'retain-on-failure'},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}],
  webServer:{command:'npm run dev -- --port 3100',url:'http://localhost:3100/age-check',reuseExistingServer:false,timeout:120000,
    env:{DATABASE_URL:'',NEON_AUTH_BASE_URL:'',NEON_AUTH_COOKIE_SECRET:'browser-test-secret-that-is-at-least-32-characters',FLUTTERWAVE_SECRET_KEY:'',FLUTTERWAVE_SECRET_HASH:'',RESEND_API_KEY:'',UPSTASH_REDIS_REST_URL:'',UPSTASH_REDIS_REST_TOKEN:'',AZURE_STORAGE_CONNECTION_STRING:'',AZURE_OPENAI_KEY:'',NEXT_PUBLIC_APP_URL:'http://localhost:3100',SENTRY_DSN:'',NEXT_PUBLIC_SENTRY_DSN:''}},
});
