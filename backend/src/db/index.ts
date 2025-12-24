import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getPool(connectionString: string, options?: { max?: number; min?: number }): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString,
            max: options?.max ?? 10,
            min: options?.min ?? 2,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });
    }
    return pool;
}

export function getDb(connectionString: string, options?: { max?: number; min?: number }) {
    if (!db) {
        const p = getPool(connectionString, options);
        db = drizzle(p, { schema });
    }
    return db;
}

export async function closeDb() {
    if (pool) {
        await pool.end();
        pool = null;
        db = null;
    }
}

export { schema };
