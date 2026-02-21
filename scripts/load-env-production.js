/**
 * Load .env.production so "npm run dev" uses production env for testing.
 * Keeps one source of truth: .env.production
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env.production') });
