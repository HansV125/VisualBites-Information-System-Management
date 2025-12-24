import { Controller, Post, Body, Res, Get, Req, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import type { Response, Request } from 'express';

// Cookie configuration
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(loginDto.email, loginDto.password);

        // Set access token cookie (short-lived)
        res.cookie('jwt', result.accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        // Set refresh token cookie (long-lived)
        res.cookie('jwt_refresh', result.refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Generate and set CSRF token
        const csrfToken = this.authService.generateCsrfToken();
        res.cookie('csrf_token', csrfToken, {
            ...COOKIE_OPTIONS,
            httpOnly: false, // Frontend needs to read this
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { message: 'Logged in', user: result.user };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @SkipThrottle()
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['jwt_refresh'];
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token');
        }

        const tokens = await this.authService.refreshTokens(refreshToken);

        // Set new access token
        res.cookie('jwt', tokens.accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000,
        });

        // Rotate refresh token
        res.cookie('jwt_refresh', tokens.refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { message: 'Token refreshed' };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User logout' })
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('jwt', { path: '/' });
        res.clearCookie('jwt_refresh', { path: '/' });
        res.clearCookie('csrf_token', { path: '/' });
        return { message: 'Logged out' };
    }

    @Get('me')
    @SkipThrottle()
    @ApiOperation({ summary: 'Get current user' })
    @ApiResponse({ status: 200, description: 'User info returned' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getMe(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const accessToken = req.cookies['jwt'];
        const refreshToken = req.cookies['jwt_refresh'];

        // Try access token first
        if (accessToken) {
            const user = await this.authService.verifyToken(accessToken);
            if (user) {
                return user;
            }
        }

        // If access token expired, try refresh
        if (refreshToken) {
            try {
                const tokens = await this.authService.refreshTokens(refreshToken);

                // Set new cookies
                res.cookie('jwt', tokens.accessToken, {
                    ...COOKIE_OPTIONS,
                    maxAge: 15 * 60 * 1000,
                });
                res.cookie('jwt_refresh', tokens.refreshToken, {
                    ...COOKIE_OPTIONS,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });

                const user = await this.authService.verifyToken(tokens.accessToken);
                return user;
            } catch {
                throw new UnauthorizedException('Session expired');
            }
        }

        throw new UnauthorizedException('Not authenticated');
    }
}
