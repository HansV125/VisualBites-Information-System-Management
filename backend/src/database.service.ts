import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './db/schema';

export type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);
    private pool: Pool;
    public db: DrizzleDB;

    constructor(private config: ConfigService) {
        const connectionString = config.get<string>('DATABASE_URL');
        if (!connectionString) {
            throw new Error('DATABASE_URL is required');
        }

        this.pool = new Pool({
            connectionString,
            max: parseInt(config.get('DB_POOL_MAX') || '10'),
            min: parseInt(config.get('DB_POOL_MIN') || '2'),
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });

        this.db = drizzle(this.pool, { schema });
    }

    async onModuleInit() {
        try {
            const client = await this.pool.connect();
            client.release();
            this.logger.log('Database connected successfully');
        } catch (error) {
            this.logger.error('Failed to connect to database', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.pool.end();
        this.logger.log('Database connections closed');
    }

    async isHealthy(): Promise<boolean> {
        try {
            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            return true;
        } catch {
            return false;
        }
    }
}
