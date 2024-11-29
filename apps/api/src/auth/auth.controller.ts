import { Body, Post, HttpException, HttpStatus, BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto, LoginDto, GitHubLoginDto } from '~/dto';
import { BaseController } from '~decorators/version.decorator';
import { UserRole } from '~types';
// import { SkipThrottle, Throttle } from '@nestjs/throttler';

@BaseController('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    // @Throttle('short') // Applies the short throttler I defined in app.module.ts
    @Post('signup')
    async signup(@Body() userDto: UserDto) {
        console.log('Received DTO:', userDto); // Debugging
        try {
            const enrichedUserDto = {
                isPremium: false,
                isAdmin: false,
                role: UserRole.User,
                ...userDto,
            };
            const user = await this.authService.signup(enrichedUserDto);
            return { message: 'User created successfully', user };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ConflictException) {
                throw error;
            }
            throw new HttpException('Unexpected server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            const result = await this.authService.login(loginDto);
            return { message: 'Login successful', ...result };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            if (error instanceof Error && Array.isArray((error as any).response?.message)) {
                throw new BadRequestException({
                    message: (error as any).response.message,
                    error: 'Validation failed'
                });
            }
            throw new HttpException(
                (error as Error).message || 'An error occurred during signup',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('github-login')
    async githubLogin(@Body() githubLoginDto: GitHubLoginDto) {
        try {
            const result = await this.authService.githubLogin(githubLoginDto);
            return { ok: true, ...result };
        } catch (error) {
            throw new HttpException((error as Error).message, HttpStatus.UNAUTHORIZED);
        }
    }
}

