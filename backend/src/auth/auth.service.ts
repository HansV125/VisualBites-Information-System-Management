import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';

export interface TokenPayload {
    email: string;
    sub: string;
    name: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class AuthService {
    private readonly ACCESS_TOKEN_EXPIRY = '15m';
    private readonly REFRESH_TOKEN_EXPIRY = '7d';

    constructor(
        private database: DatabaseService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.database.db.query.users.findFirst({
            where: eq(schema.users.email, email)
        });

        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(email: string, pass: string) {
        const user = await this.validateUser(email, pass);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = this.generateTokens(user);

        return {
            ...tokens,
            user: user,
        };
    }

    generateTokens(user: { id: string; email: string; name: string | null }) {
        const payload: TokenPayload = {
            email: user.email,
            sub: user.id,
            name: user.name || ''
        };

        return {
            accessToken: this.jwtService.sign(payload, { expiresIn: this.ACCESS_TOKEN_EXPIRY }),
            refreshToken: this.jwtService.sign(
                { ...payload, type: 'refresh' },
                { expiresIn: this.REFRESH_TOKEN_EXPIRY }
            ),
        };
    }

    async refreshTokens(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken) as TokenPayload & { type?: string };

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Invalid token type');
            }

            const user = await this.database.db.query.users.findFirst({
                where: eq(schema.users.id, payload.sub)
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            return this.generateTokens({
                id: user.id,
                email: user.email,
                name: user.name || '',
            });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async verifyToken(token: string): Promise<TokenPayload | null> {
        try {
            const payload = this.jwtService.verify(token) as TokenPayload;

            if (payload.exp) {
                const now = Math.floor(Date.now() / 1000);
                const timeLeft = payload.exp - now;
                if (timeLeft < 0) {
                    return null;
                }
            }

            return payload;
        } catch {
            return null;
        }
    }

    generateCsrfToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    verifyCsrfToken(token: string, storedToken: string): boolean {
        if (!token || !storedToken) return false;
        return crypto.timingSafeEqual(
            Buffer.from(token),
            Buffer.from(storedToken)
        );
    }
}
