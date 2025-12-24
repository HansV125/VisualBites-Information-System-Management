/**
 * Environment variables validation and type-safe access
 */

// Define required environment variables
const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
] as const;

// Optional environment variables with defaults
const optionalEnvVars = {
    NEXT_PUBLIC_WS_URL: null,
    NEXT_PUBLIC_SITE_URL: 'https://vb.lyst.qzz.io',
} as const;

// Validate required environment variables
export function validateEnv(): void {
    const missing: string[] = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    if (missing.length > 0 && process.env.NODE_ENV === 'production') {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        );
    }

    if (missing.length > 0) {
        console.warn(
            `⚠️ Missing environment variables: ${missing.join(', ')}`
        );
    }
}

// Type-safe environment variable access
export const env = {
    get apiUrl(): string {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    },
    get wsUrl(): string | null {
        return process.env.NEXT_PUBLIC_WS_URL || null;
    },
    get siteUrl(): string {
        return process.env.NEXT_PUBLIC_SITE_URL || optionalEnvVars.NEXT_PUBLIC_SITE_URL;
    },
    get isDev(): boolean {
        return process.env.NODE_ENV === 'development';
    },
    get isProd(): boolean {
        return process.env.NODE_ENV === 'production';
    },
} as const;

// Run validation on import (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    validateEnv();
}
